from rest_framework import serializers
from .models import Eat, Category


class EatSerializer(serializers.ModelSerializer):
    model_url = serializers.ReadOnlyField()
    model_status = serializers.ReadOnlyField()

    class Meta:
        model = Eat
        fields = "__all__"


class CreateEatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eat
        fields = ["name", "description", "price", "image", "restaurant", "category"]


class PublicEatSerializer(serializers.ModelSerializer):
    model_url = serializers.ReadOnlyField()
    model_status = serializers.ReadOnlyField()

    class Meta:
        model = Eat
        fields = ["id", "name", "description", "price", "image", "category", "model_url", "model_status"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class PublicCategorySerializer(serializers.ModelSerializer):
    eats = PublicEatSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "order", "eats"]
