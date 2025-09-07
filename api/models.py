
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=8, decimal_places=2)  # ikiguzi cy'igicuruzwa
    available = models.BooleanField(default=True)
    quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    nu_pie_full = models.DecimalField(max_digits=8, decimal_places=2 ,default=0)
    price_sell=models.DecimalField(max_digits=8, decimal_places=2, default=0)  # igiciro cyo kugurisha

    def __str__(self):
        return self.name

    def get_unit_cost(self):
        """Igiciro cya piece imwe ishingiye ku gicuruzwa kinini (price )"""
        try:
            return float(self.price)
        except (ValueError, ZeroDivisionError):
            return 0

    def get_unit_sell(self):
        """uko kimwe cyaragurwa"""
        try:
            return float(self.price_sell) / float(self.nu_pie_full)
        except (ValueError, ZeroDivisionError):
            return 0

    def get_profit_per_unit(self):
        """Inyungu kuri piece imwe"""
        return self.get_unit_cost() - self.get_unit_sell() 

    
class abakozi(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name_f = models.CharField(max_length=250)
    name_l = models.CharField(max_length=250)
    email_u = models.CharField(max_length=250)
    phone_u = models.CharField(max_length=250)
    status = models.CharField(max_length=250)
    date = models.CharField(max_length=250)
    id_national = models.CharField(max_length=250)
    sale = models.CharField(max_length=250)
    slug = models.SlugField(blank=True, null=True)  # ✅ remove unique temporarily

    def save(self, *args, **kwargs):
        if not self.slug:
            full_name = f"{self.name_f} {self.name_l}"
            self.slug = slugify(full_name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name_f} {self.name_l}"

# api/models.py

class Order(models.Model):
   

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    employees_id=models.CharField(max_length=100, blank=True)
    customer_name = models.CharField(max_length=100, blank=True)
    customer_phone = models.CharField(max_length=15, blank=True)
    note = models.TextField(blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    delivery_method = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, default='customer')
    created_at = models.DateTimeField(auto_now_add=True)
    confirm = models.CharField(max_length=10, null=True, blank=True) 
    confirm_money =  models.CharField(max_length=10, null=True, blank=True) 

    def __str__(self):
        return f"Order #{self.id} by {self.customer_name}"



class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class productSell(models.Model): 
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)  # e.g. 'food', 'drink'
    price = models.DecimalField(max_digits=8, decimal_places=2)
    available = models.BooleanField(default=True)
    quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    user_id=models.CharField(max_length=250)

    def __str__(self):
        return self.name