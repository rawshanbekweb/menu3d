from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator
from decimal import Decimal
from apps.restaurant.models import Restaurant


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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Eat {self.name}"

    @property
    def model_url(self):
        """
        Best-effort extraction of the generated .glb URL from the 3daistudio
        job-status payload. Key names are not yet confirmed against a live
        response (needs a real AISTUDIO_TOKEN) - update this if the provider's
        actual field names differ once verified.
        """
        data = self.model_json or {}
        for key in ("model_url", "glb_url", "url", "output_url"):
            value = data.get(key)
            if value:
                return value
        result = data.get("result")
        if isinstance(result, dict):
            for key in ("model_url", "glb_url", "url"):
                value = result.get(key)
                if value:
                    return value
        return None

    @property
    def model_status(self):
        data = self.model_json or {}
        status = data.get("status") or data.get("state")
        if status:
            return status
        return "pending" if not data else "unknown"

    class Meta:
        verbose_name = "Eat"
        verbose_name_plural = "Eats"
        ordering = ["-created_at"]
