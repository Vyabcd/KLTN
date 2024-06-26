import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeCart } from "../state/cartSlice";

const VnPay_return = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [codes, setCodes] = useState(null);

  const cartItem = useSelector((state) => state.cart.cartItem);
  const coupon = useSelector((state) => state.cart.coupon);
  const address = useSelector((state) => state.cart.address);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vnp_Params = new URLSearchParams(window.location.search);

        const response = await customFetch.get(
          "/order/vnpay_return?" + vnp_Params.toString()
        );
        const { code, orderId, paymentMethod } = response.data;
        setCodes(code);

        if (code === "00") {
          await customFetch.post("/order/create-order", {
            cartItem,
            coupon,
            address,
            orderId,
            paymentMethod,
          });
          dispatch(removeCart());
          return navigate("/order");
        } else {
          toast.error("Tạo đơn hàng thất bại");
          dispatch(removeCart());
          return navigate("/payment");
        }
      } catch (error) {
        toast.error(error?.response?.data?.msg);
        console.error("Lỗi vnpay-return:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      {codes === "00" ? (
        <p>Giao dịch thành công</p>
      ) : (
        <p style={{ color: "red" }}>GD thất bại thất bại</p>
      )}
      <p>
        <a className="btn btn-default" href="/order">
          Xem đơn đặt hàng của bạn
        </a>
      </p>
    </div>
  );
};
export default VnPay_return;
