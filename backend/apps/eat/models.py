from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator
from decimal import Decimal
from apps.restaurant.models import Restaurant


def extract_provider_model_url(data):
    """
    Extract the generated .glb URL from a 3daistudio job-status payload.
    On success the payload looks like:
        {"status": "FINISHED", "results": [{"asset": "https://.../x.glb",
         "asset_type": "3D_MODEL"}]}
    Note: this URL is a short-lived presigned link (expires in ~1 hour) -
    it must be downloaded and re-hosted (see Eat.model_file), never stored
    or served as-is long-term.
    """
    data = data or {}
    for key in ("model_url", "glb_url", "url", "output_url"):
        value = data.get(key)
        if value:
            return value

    def extract(entry):
        if not isinstance(entry, dict):
            return None
        for key in ("asset", "asset_url", "model_url", "glb_url", "url"):
            value = entry.get(key)
            if value:
                return value
        return None

    for container_key in ("results", "result"):
        container = data.get(container_key)
        entries = container if isinstance(container, list) else [container]
        for entry in entries:
            value = extract(entry)
            if value:
                return value
    return None


class Category(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.restaurant} - {self.name}"

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["order", "id"]


class Eat(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="eat_restaurant")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="eats")
    name = models.CharField(max_length=200)
    description = models.TextField(validators=[MinLengthValidator(5), MaxLengthValidator(500)])
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    image = models.ImageField(upload_to="eat/")
    task_json = models.JSONField(default=dict)
    model_json = models.JSONField(default=dict)
    # The provider's own .glb URL (model_json's "results[].asset") is a
    # presigned link that expires in ~1 hour - it gets downloaded once into
    # our own storage here so customers always have a working, permanent URL.
    model_file = models.FileField(upload_to="models/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Eat {self.name}"

    @property
    def model_url(self):
        """
        Only ever the permanent, re-hosted file - never the provider's raw
        presigned link (it expires in ~1 hour, so exposing it here would
        just hand out a URL that goes dead shortly after being read).
        """
        return self.model_file.url if self.model_file else None

    @property
    def model_status(self):
        data = self.model_json or {}
        status = data.get("status") or data.get("state")
        status = status.lower() if isinstance(status, str) else status
        # The provider says it's finished, but we haven't re-hosted the file
        # yet (or a previous download attempt failed) - one more "Tekshirish"
        # will retry the download.
        if status in ("finished", "success", "succeeded", "completed") and not self.model_file:
            return "downloading"
        if status:
            return status
        return "pending" if not data else "unknown"

    @property
    def model_progress(self):
        data = self.model_json or {}
        progress = data.get("progress")
        return progress if isinstance(progress, (int, float)) else None

    @property
    def model_error(self):
        data = self.model_json or {}
        return data.get("failure_reason") or data.get("error") or None

    class Meta:
        verbose_name = "Eat"
        verbose_name_plural = "Eats"
        ordering = ["-created_at"]
