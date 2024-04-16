import React, { useState } from "react";
import { PayPalButton } from "../../components";
import { VnPayButton } from "../../components";

const PaymentCheckout = ({
  cartItem,
  coupon,
  applyCoupon,
  totalAmount,
  paypalButtonKey,
}) => {
  const [code, setCode] = useState();

  return (
    <div>
      <div style={{ width: "100%" }}>
        <input
          onChange={(event) => setCode(event.target.value)}
          type="text"
          placeholder="Enter coupon"
        />
        <button className="btn-apply" onClick={() => [applyCoupon(code)]}>
          Apply
        </button>
      </div>
      {coupon && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            border: "1px solid black",
          }}
        >
          <span>Đã áp dụng mã giảm giá:</span>
          <span>{coupon.name}</span>
          <span>{coupon.code}</span>
          <span>
            Giảm{" "}
            {coupon.discountValue
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            {coupon.discountType === "percentage" ? "%" : "vnd"}
          </span>
        </div>
      )}

      <h4>{totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₫</h4>
      <PayPalButton
        key={paypalButtonKey}
        cartItem={cartItem}
        coupon={coupon}
        totalAmount={totalAmount}
      />
      <VnPayButton totalPrice={totalAmount} />
    </div>
  );
};

export default PaymentCheckout;