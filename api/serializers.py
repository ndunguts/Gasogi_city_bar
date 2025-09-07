# api/serializers.py

from rest_framework import serializers
from .models import Product, Order, OrderItem ,abakozi ,productSell

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        return order    



class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())  
    product_name = serializers.CharField(source='product.name', read_only=True)  # <-- aha

    class Meta:
        model = OrderItem
        fields = ["product","product_name", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=10, decimal_places=2)

    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = "__all__"

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        insufficient_stock = []

        # Reba stock mbere yo gukora order
        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]
            if product.quantity < quantity:
                insufficient_stock.append(
                    f"'{product.name}' hasigaye {product.quantity}"
                )

        if insufficient_stock:
            # Hamwe message imwe yerekana products zose zifite stock nkeya
            message = "❌ Stock idahagije kuri: " + ", ".join(insufficient_stock) + \
                      ". Mutwihaganiye Muminota mike stock izaba yuzuye."
            raise serializers.ValidationError({"detail": message})

        # Niba stock ihagije
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]
            OrderItem.objects.create(order=order, **item_data)
            product.quantity -= quantity
            product.save()

        return order



class abakoziSerializer(serializers.ModelSerializer):
    class Meta:
        model = abakozi   
        fields = '__all__'
class productSellSerializer(serializers.ModelSerializer):
    model= productSell 
    fields = '__all__'    