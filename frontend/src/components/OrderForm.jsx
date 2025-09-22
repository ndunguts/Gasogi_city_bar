import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import styles from "./OrderForm.module.css";
import axios from "axios";

export default function OrderForm() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    note: "",
    delivery_method: "",
  });
  const [loading, setLoading] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * (item.quantity || 1),
    0
  );

  // Auto-fill name & phone niba logged-in
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name_f + " " + user.name_l,
        phone: user.phone_u,
      }));
    }
  }, [isLoggedIn, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showSummary = () => setSummaryVisible(true);

  const handlePayment = async () => {
    if (!formData.delivery_method) {
      alert("Hitamo delivery method");
      return;
    }
    if (!isLoggedIn && (!formData.phone || !formData.name)) {
      alert("Injiza izina na numero ya telephone");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("http:13.53.133.56/api/abakozi/", {
        params: {
          phone: formData.phone,
          amount: total.toFixed(0),
        },
      });

      if (res.data.status === 202) {
        alert("📱 Reba kuri telefone yawe wemere ubwishyu (*182#)");
        setPaymentDone(true);
      } else {
        alert("💥 Kwishyura byanze. Ongera ugerageze.");
      }
    } catch (error) {
      alert("❌ Kwishyura byanze. Reba connection yawe cyangwa numero.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrder = async () => {
    setLoading(true);

    const payload = {
      employees_id: user.id,
      customer_name: user.name_f,
      customer_phone: user.phone_u,
      note: formData.note,
      delivery_method: formData.delivery_method,
      items: cartItems.map((item) => ({
        product: item.id,
        quantity: item.quantity || 1,
        price: parseFloat(item.price),
      })),
      total,
      status: "employee",
    };

    if (isLoggedIn) {
      payload.employee_id = user.id;
    } else {
      payload.customer_name = formData.name;
      payload.customer_phone = formData.phone;
    }

    try {
      await axios.post("http://13.53.133.56/api/orders/", payload);
      clearCart();
      alert("✅ Order yatanzwe neza!");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        // Hano tugaragaza message yavuye muri backend
        alert(err.response.data.detail);
      } else {
        alert("Habaye ikibazo mu kubika order.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h2 className={styles.title}>📦 Order Summary & Confirmation {user?.id}</h2>

        {summaryVisible && (
          <div className={styles.summaryBox}>
            <h3>🧾 Ibicuruzwa wahisemo</h3>
            <ul>
              {cartItems.map((i) => (
                <li key={i.id}>
                  {i.name} x {i.quantity || 1} ={" "}
                  {(parseFloat(i.price) * (i.quantity || 1)).toFixed(0)} RWF
                </li>
              ))}
            </ul>
            <p className={styles.total}>
              Total: <strong>{total.toFixed(0)} RWF</strong>
            </p>
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!summaryVisible) return showSummary();

            if (isLoggedIn) {
              await saveOrder();
            } else {
              if (!paymentDone) return handlePayment();
              await saveOrder();
            }
          }}
          className={styles.form}
        >
          {!isLoggedIn && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="name">Izina ryawe</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">Número ya telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>Uburyo bwo kuyibona</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="delivery_method"
                  value="home"
                  checked={formData.delivery_method === "home"}
                  onChange={handleChange}
                  required
                />
                🏠 Murabizanira
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="delivery_method"
                  value="job"
                  checked={formData.delivery_method === "job"}
                  onChange={handleChange}
                  required
                />
                🏢 Nzayifatira
              </label>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="note">Note (optional)</label>
            <textarea
              name="note"
              rows="2"
              value={formData.note}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? "📡 Gutegereza..."
              : isLoggedIn
              ? "✅ Emeza Order (Employe)"
              : paymentDone
              ? "✅ Emeza Order (Customer)"
              : "💰 Kwishyura"}
          </button>
        </form>
      </div>
    </div>
  );
}
