import React, { useState } from "react";
import styled from "styled-components";
import { Helmet, HelmetProvider } from "react-helmet-async";
import EventInfor from "../components/EventPage/EventInfor.jsx";
import EventProduct from "../components/EventPage/EventProduct.jsx";
import EventCoupon from "../components/EventPage/EventCoupon.jsx";
import EventCheck from "../components/EventPage/EventCheck.jsx";
import { Button, message, Steps, Form, Breadcrumb } from "antd";
import customFetch from "../utils/customFetch.js";
import { useLoaderData, useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  width: 100%;

  .title {
    text-align: left;
    font-size: 1.5rem;
    font-weight: bold;
    color: #00193b;
    margin-bottom: 1rem;
  }
  .input-title {
    font-size: 0.95rem;
    font-weight: 400;
  }
  .col-1 {
    width: 60%;
    height: fit-content;
  }
  .col-2 {
    width: 40%;
    height: fit-content;
  }
  .col-2-item {
    border: 1px solid lightgray;
    border-radius: 10px;
  }
  .col-1-item {
    border: 1px solid lightgray;
    border-radius: 10px;
  }
  .ant-steps {
    margin-top: 50px;
    margin-bottom: 50px;
  }
`;

export const loader = async () => {
  try {
    const products = await customFetch
      .get(`/product/?populate=category`)
      .then(({ data }) => data);

    const categories = await customFetch
      .get("/category/all-categories")
      .then(({ data }) => data);

    const orders = await customFetch.get(`/order/`).then(({ data }) => data);

    return { products, categories, orders };
  } catch (error) {
    return error;
  }
};

const AddEvent = () => {
  const { products, categories, orders } = useLoaderData();
  const navigate = useNavigate();

  products.forEach((product) => {
    product.sold = orders.reduce((total, order) => {
      return (
        total +
        order.orderItem.filter((item) => product._id === item.product.id).length
      );
    }, 0);
  });

  const [current, setCurrent] = useState(0);

  // Info
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    }
  };

  // Product
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleAddEvent = async () => {
    try {
      if (name && discount && startDate && endDate && selectedProductIds) {
        const data = {
          name,
          description,
          discount,
          startDate,
          endDate,
          products: selectedProductIds,
        };
        const promotion = await customFetch.post("/promotion/create", data);
        if (promotion) {
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: "Infor",
      content: (
        <EventInfor
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          discount={discount}
          setDiscount={setDiscount}
          dates={[startDate, endDate]}
          handleDateRangeChange={handleDateRangeChange}
        />
      ),
    },
    {
      title: "Choose product",
      content: (
        <EventProduct
          products={products}
          categories={categories}
          selectedProductIds={selectedProductIds}
          setSelectedProductIds={setSelectedProductIds}
          setSelectedProducts={setSelectedProducts}
        />
      ),
    },
    {
      title: "Coupon",
      content: <EventCoupon />,
    },
    {
      title: "Check",
      content: (
        <EventCheck
          name={name}
          description={description}
          discount={discount}
          startDate={startDate}
          endDate={endDate}
          products={products}
          categories={categories}
          selectedProducts={selectedProducts}
        />
      ),
    },
  ];

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  return (
    <HelmetProvider>
      <Wrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <title>AddEvent</title>
        </Helmet>
        <Breadcrumb
          style={{ paddingBottom: "1rem" }}
          items={[
            {
              title: <a href="/">Dashboard</a>,
            },
            {
              title: <a href="/add-event">AddEvent</a>,
            },
            {
              title: "Add Event",
            },
          ]}
        />

        <div className="title">Event</div>
        <Steps current={current} items={items} />
        <div
          style={{ lineHeight: "260px", textAlign: "center", marginTop: 16 }}
        >
          {steps[current].content}
        </div>
        <div style={{ marginTop: 20 }}>
          {current < steps.length - 1 && (
            <Button size="large" type="primary" onClick={next}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              size="large"
              type="primary"
              onClick={() => handleAddEvent()}
            >
              Done
            </Button>
          )}
          {current > 0 && (
            <Button size="large" style={{ margin: "0 8px" }} onClick={prev}>
              Previous
            </Button>
          )}
        </div>
      </Wrapper>
    </HelmetProvider>
  );
};

export default AddEvent;