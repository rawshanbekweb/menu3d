from rest_framework import generics, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.restaurant.models import RestaurantStaff
from apps.restaurant.permissions import is_restaurant_role
from .models import Eat, Category
from .serializers import EatSerializer, CreateEatSerializer, CategorySerializer
from .permissions import IsMineEat
from utils.ai import api


class EatListCreateAPIView(generics.ListCreateAPIView):
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]
    queryset = Eat.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EatSerializer
        return CreateEatSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsMineEat()]

    def get_queryset(self):
        queryset = Eat.objects.all()
        restaurant_id = self.request.query_params.get("restaurant")
        if restaurant_id:
            queryset = queryset.filter(restaurant_id=restaurant_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        restaurant = serializer.validated_data["restaurant"]
        if not is_restaurant_role(request.user, restaurant, RestaurantStaff.Role.OWNER, RestaurantStaff.Role.MANAGER):
            return Response({"detail": "You do not have permission to perform this action."}, status=403)
        serializer.save()

        task_json = api.send_image(serializer.instance.image.url)
        serializer.instance.task_json = task_json
        serializer.instance.save(update_fields=["task_json"])

        return Response(EatSerializer(serializer.instance).data, status=201)


class EatDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Eat.objects.all()
    serializer_class = EatSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsMineEat()]


class CheckTaskAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        eat = Eat.objects.filter(id=pk).first()
        if not eat:
            return Response({"detail": "eat not found"}, status=404)

        if not is_restaurant_role(request.user, eat.restaurant, RestaurantStaff.Role.OWNER, RestaurantStaff.Role.MANAGER):
            return Response({"detail": "You do not have permission to perform this action."}, status=403)

        task_id = eat.task_json.get("task_id", None)
        if not task_id:
            return Response({"detail": "error in rendering", "task_json": eat.task_json}, status=400)

        model_json = api.show_model(task_id)
        eat.model_json = model_json
        eat.save(update_fields=["model_json"])
        return Response(model_json, status=200)


class CategoryListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsMineEat()]

    def get_queryset(self):
        queryset = Category.objects.all()
        restaurant_id = self.request.query_params.get("restaurant")
        if restaurant_id:
            queryset = queryset.filter(restaurant_id=restaurant_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        restaurant = serializer.validated_data["restaurant"]
        if not is_restaurant_role(request.user, restaurant, RestaurantStaff.Role.OWNER, RestaurantStaff.Role.MANAGER):
            return Response({"detail": "You do not have permission to perform this action."}, status=403)
        serializer.save()
        return Response(CategorySerializer(serializer.instance).data, status=201)


class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsMineEat()]
