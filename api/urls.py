from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import * 

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('orders', OrderViewSet)
router.register('abakozi',abakoziViewSet)
router.register('sellproduct',sellproductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('orders/', OrderCreateAPIView.as_view(), name='order-create'),
    path('orders_by_date/', orders_by_date, name='orders-by-date'),
    path("orders_with_ai/", orders_with_ai, name="orders_with_ai"),
    path('employee/<int:employee_id>/orders/', employee_orders_unconfirmed),
    
   
   
]
