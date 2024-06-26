import React, { useRef, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import customFetch from "../utils/customFetch.js";
import Wrapper from "../assets/wrapper/coupon/AllCoupon.js";
import { useNavigate, useLoaderData } from "react-router-dom";
import {
  EditOutlined,
  AudioOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Table, Button, Input, Dropdown, Space } from "antd";
import Highlighter from "react-highlight-words";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

export const loader = async () => {
  try {
    const coupons = await customFetch
      .get(`/coupon/all-coupons`)
      .then(({ data }) => data);
    return coupons;
  } catch (error) {
    return error;
  }
};

const AllCoupon = () => {
  const coupons = useLoaderData();
  const navigate = useNavigate();

  dayjs.extend(customParseFormat);
  const dateFormat = "HH:mm:ss DD-MM-YYYY";

  //Dropdown
  const items = [
    {
      label: "Edit",
      key: "1",
      icon: <EditOutlined />,
      onClick: (_id) => handleEditCoupon(_id),
    },
  ];

  const handleAddCoupon = () => {
    navigate("/add-coupon");
  };

  const handleEditCoupon = (id) => {
    navigate(`/edit-coupon/${id}`);
  };
  const handleViewCoupon = (id) => {
    navigate(`/edit-coupon/${id}`);
  };

  // Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  //Danh sách các cột
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      ...getColumnSearchProps("code"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ...getColumnSearchProps("description"),
    },
    {
      title: "Discount",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (discountValue, record) =>
        record.discountType === "percentage" ? (
          <p>{discountValue + "%"}</p>
        ) : (
          <p>
            {discountValue?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
              "₫"}
          </p>
        ),
      filters: [
        {
          text: "Percentage (%)",
          value: "percentage",
        },
        { text: "Fixed (vnđ)", value: "fixed" },
      ],
      onFilter: (value, record) => record?.discountType === value,
    },
    // {
    //   title: "Start",
    //   dataIndex: "startDate",
    //   key: "startDate",
    //   render: (startDate) => (
    //     <span className="md-font">{startDate?.split("T")[0]}</span>
    //   ),
    // },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      render: (startDate) => (
        <span className="md-font">
          {dayjs(new Date(startDate).toString()).format(dateFormat)}
        </span>
      ),
    },
    {
      title: "End",
      dataIndex: "endDate",
      key: "endDate",
      render: (endDate) => (
        <span className="md-font">
          {dayjs(new Date(endDate).toString()).format(dateFormat)}
        </span>
      ),
    },
    {
      title: "Used",
      dataIndex: "used",
      key: "used",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.sold - b.sold,
    },
    {
      title: "Action",
      key: "operation",
      width: 150,
      fixed: "right",
      render: ({ _id }) => (
        <Dropdown.Button
          onClick={() => handleViewCoupon(_id)}
          menu={{
            items: items.map((item) => ({
              ...item,
              onClick: () => item.onClick(_id),
            })),
          }}
        >
          <EyeOutlined />
          View
        </Dropdown.Button>
      ),
    },
  ];

  //Search
  const onSearch = (value, _e, info) => console.log(info?.source, value);

  // onChange của sorter và filter data cột
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  // Số lượng sản phẩm trên mỗi trang
  const paginationConfig = {
    pageSize: 10,
  };

  return (
    <HelmetProvider>
      <Wrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <title>All Coupon</title>
        </Helmet>

        <Breadcrumb
          style={{ paddingBottom: "1rem" }}
          items={[
            {
              title: <a onClick={() => navigate("/")}>Dashboard</a>,
            },
            {
              title: "Coupon",
            },
          ]}
        />

        <div className="title">Coupon</div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ width: 150 }}
            onClick={handleAddCoupon}
          >
            Add Coupon
          </Button>
        </div>

        <Table
          className="table"
          pagination={paginationConfig}
          columns={columns}
          dataSource={coupons.map((coupon) => ({
            ...coupon,
            key: coupon._id,
          }))}
          onChange={onChange}
          scroll={{ x: 1200 }}
          showSorterTooltip={{
            target: "sorter-icon",
          }}
        />
      </Wrapper>
    </HelmetProvider>
  );
};

export default AllCoupon;
