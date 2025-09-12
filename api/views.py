from rest_framework import viewsets
from .models import *
from .serializers import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import uuid
import requests
import logging
from rest_framework.views import APIView
from datetime import datetime
from django.db.models import Sum, F, FloatField, ExpressionWrapper
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated





logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, F, FloatField, ExpressionWrapper
from datetime import datetime
from .models import Order, OrderItem, Product
from .serializers import OrderSerializer

@api_view(['GET'])
def orders_by_date(request):
    date_str = request.query_params.get('date')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    orders = Order.objects.all()

    # Filter by date or date range
    if date_str:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        orders = orders.filter(created_at__date=date)
    elif start_date and end_date:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        orders = orders.filter(created_at__date__gte=start, created_at__date__lte=end)

    # ------------------------------
    # Orders confirmed = "ok"
    # ------------------------------
    confirmed_orders = orders.filter(confirm="ok")

    # Serialize orders
    serializer = OrderSerializer(confirmed_orders, many=True)
    total_orders_amount = sum(float(order['total']) for order in serializer.data)

    # ------------------------------
    # Customer summary
    # ------------------------------
    customer_summary = {}
    for order in confirmed_orders:
        name = order.customer_name
        if name not in customer_summary:
            customer_summary[name] = {'count': 0, 'total': 0}
        customer_summary[name]['count'] += 1
        customer_summary[name]['total'] += float(order.total)
    customer_summary_list = [
        {'customer_name': k, 'count': v['count'], 'total': v['total']}
        for k, v in customer_summary.items()
    ]

    # ------------------------------
    # Product summary (quantity + profit)
    # ------------------------------
    product_summary = (
    OrderItem.objects.filter(order__in=confirmed_orders)
    .values("product__name")
    .annotate(
        total_quantity=Sum("quantity"),
        unit_sell =F("price"),
        total_sales=Sum(F("price") * F("quantity"), output_field=FloatField()),
        unit_buy=ExpressionWrapper(
            F("product__price_sell") / F("product__nu_pie_full"),
            output_field=FloatField()
        ),
        total_cost=Sum(
            ExpressionWrapper(
                (F("product__price_sell") / F("product__nu_pie_full")) * F("quantity"),
                output_field=FloatField()
            )
        ),
    )
    .annotate(
        profit=ExpressionWrapper(F("total_sales") - F("total_cost"), output_field=FloatField())
    )
)
    

    return Response({
        "orders": serializer.data,
        "total": total_orders_amount,
        "customers": customer_summary_list,
        "products": list(product_summary),
    })

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer

class OrderCreateAPIView(APIView):
    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class abakoziViewSet(viewsets.ModelViewSet):
    queryset = abakozi.objects.all()
    serializer_class = abakoziSerializer
    
class sellproductViewSet(viewsets.ModelViewSet) :
    queryset = productSell.objects.all()
    serializer_class = productSellSerializer




### AI 

@api_view(['GET'])
def orders_with_ai(request):
    date = request.GET.get("date")
    

    if not date:
        return Response({"error": "date is required"}, status=400)

    items = (
        OrderItem.objects.filter(order__created_at__date=date, order__confirm="ok")
        .values("product__id", "product__name")
        .annotate(total_quantity=Sum("quantity"), total_sales=Sum(F("price") * F("quantity") ))
    )

    results = []
    for item in items:
        product = get_object_or_404(Product, id=item["product__id"])

        numberhalf= product.nu_pie_full/2
        # Simple AI rule: if sold < 5 -> recommend restock
        if product.quantity <= numberhalf:
            recommendation = "restock ariko nugire ubwoba ahubwo tegura ko waragura "
        elif item["total_quantity"] >= product.nu_pie_full:
            recommendation = "Hot Selling - Promote more Ariko nkujyiriye Inama ugomba kureza cyane uko waraguraga ushatse wigurize kubindi bitari gucuruza"
        elif product.quantity <= 3:
            recommendation = "tabara witabara kuko stock irihasi cyane "
        else:
            recommendation = "No Action"

        results.append({
            "product": item["product__name"],
            "quantity_sold": item["total_quantity"],
            "total_sales": item["total_sales"],
            "recommendation": recommendation,
        })

    return Response({"products": results})


### pay comfirm ####

@api_view(['GET'])
def employee_orders_unconfirmed(request, employee_id):
    """
    Fata orders z'umukozi zitarafite confirm_money 
    (null cyangwa empty string)
    """
    orders = Order.objects.filter(
        Q(employees_id=employee_id) & (Q(confirm_money__isnull=True) | Q(confirm_money=''))
    )
    
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


###### My Orders ###############



