import React from "react";
import styled from "styled-components";
import ProductContainer from "../ProductContainer";
import NavLinks from "../NavLinks";
import { NavLink } from "react-router-dom";

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

  /* PRODUCTS */
  .super-container {
    //width: 19%;
  }

  /* MEDIA QUERIES */
  @media (max-width: 1020px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  @media (max-width: 850px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media (max-width: 690px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 350px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

const AllProduct = ({ products }) => {
  return (
    <Wrapper>
      {products.map((product) => {
        return (
          <NavLink to={`/product/${product.slug}`}>
            <ProductContainer
              key={product._id}
              img={product.images}
              name={product.name}
              price={product.price}
              oldPrice={product.oldPrice}
              descript={product.descript}
            />
          </NavLink>
        );
      })}
    </Wrapper>
  );
};

export default AllProduct;
