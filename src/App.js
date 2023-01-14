import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useRef, useState } from "react";
import { Button, Card, CloseButton, Col, Container, Form, ListGroup, Modal, Row, Stack } from "react-bootstrap";
import "./css/App.scss";

const PRODUCT_DATA = [
  {
    id: 0,
    title: "White and Black",
    content: "Born in France",
    price: 120000,
  },

  {
    id: 1,
    title: "Red Knit",
    content: "Born in Seoul",
    price: 110000,
  },

  {
    id: 2,
    title: "Grey Yordan",
    content: "Born in the States",
    price: 130000,
  },
];

/** 
  숫자 세자리마다 콤마 찍기 위함 ex) 1000 => 1,000
  @param number
*/
const getPriceComma = (price) => {
  return price.toLocaleString("ko-KR");
};

function App() {
  // ----- 데이터 불러오기 -----
  const [shoesData, setShoesData] = useState(PRODUCT_DATA);

  useEffect(() => {
    axios.get(`https://codingapple1.github.io/shop/data${2}.json`).then((result) => {
      setShoesData([...shoesData, ...result.data]);
    });
  }, []);
  // ----- 데이터 불러오기 -----

  // ----- 모달창 visible -----
  const [isModalVisible, setIsModalVisible] = useState(false);
  const refModal = useRef();

  const openBuyModal = () => {
    if (priceTotal > 500000) {
      return window.alert("상품 가격을 500,000원 이하로 맞춰주세요.");
    }
    if (priceTotal === 0) {
      return window.alert("장바구니에 담긴 상품이 없습니다.");
    }
    setIsModalVisible(true);
  };

  useEffect(() => {
    // 모달이 열려 있고 모달의 바깥쪽을 눌렀을 때 창 닫기
    const clickOutside = (e) => {
      if (isModalVisible && !refModal.current.contains(e.target)) {
        setIsModalVisible(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [isModalVisible]);
  // ----- 모달창 visible -----

  // ~장바구니
  // ----- 장바구니에 제품 추가하기 -----
  const [cartList, setCartList] = useState([]);
  const [idSelectedItem, setIdSelectedItem] = useState(null);
  const addItemIntoCartList = (id) => {
    // id와 같은 제품을 데이터에서 찾기
    setIdSelectedItem(id);

    const itemFoundByIdFromShoesData = shoesData.find((shoes) => shoes.id === id);

    // cartList 데이터 업데이트하기 (있으면 수량++, 없으면 상품목록에 추가)
    if (itemFoundByIdFromShoesData.amount) {
      return (itemFoundByIdFromShoesData.amount += 1);
    }
    itemFoundByIdFromShoesData.amount = 1;
    setCartList([...cartList, itemFoundByIdFromShoesData]);
  };

  // ----- 장바구니에 제품 추가하기 -----

  // ----- 장바구니 제품 "+", "-"로 수량 바꾸기 -----
  const plusCartItemAmount = (id, boolean) => {
    setIdSelectedItem(id);
    const itemFoundByIdFromCartList = cartList.find((cartItem) => cartItem.id === id);
    // 수량을 1더하기 한다.
    if (boolean) {
      return (itemFoundByIdFromCartList.amount += 1);
    }

    // 수량이 1이상일 때 -1
    if (itemFoundByIdFromCartList.amount > 0) {
      itemFoundByIdFromCartList.amount -= 1;
    }
  };
  // ----- 장바구니 제품 "+", "-"로 수량 바꾸기 -----

  // ----- 장바구니에서 선택한 제품 삭제하기 -----
  const removeCartItem = (id) => {
    const tempCartList = [...cartList];
    const itemIndexSelectedByIdFromCartList = tempCartList.findIndex((tempCartItem) => tempCartItem.id === id);
    const itemFoundByIdFromCartList = tempCartList.find((tempCartItem) => tempCartItem.id === id);

    // 수량 초기화
    itemFoundByIdFromCartList.amount = 0;
    // 제품 배열에서 제외
    tempCartList.splice(itemIndexSelectedByIdFromCartList, 1);

    setCartList([...tempCartList]);
  };
  // ----- 장바구니에서 선택한 제품 삭제하기 -----

  // ----- 장바구니에 담긴 아이템 전체가격 -----
  const [priceTotal, setPriceTotal] = useState(0);

  const getPriceTotalFromCartList = (itemList) => {
    let tempPriceTotal = 0;

    if (itemList) {
      itemList.forEach((item) => {
        tempPriceTotal += item.price * item.amount;
      });
    }

    return tempPriceTotal;
  };

  useEffect(() => {
    if (priceTotal > 500000) {
      window.alert("상품가격이 500,000원을 초과했습니다. 상품을 제외해주세요.");
    }
  }, [priceTotal]);
  // ----- 장바구니에 담긴 아이템 전체가격 -----

  // ----- 장바구니 비우기 -----
  const clearCartList = () => {
    cartList.forEach((cartItem) => (cartItem.amount = 0));
    setCartList([]);
  };
  // ----- 장바구니 비우기 -----

  // 장바구니 렌더링용 state 변화감지 (지금은 id 변화 감지, 원래는 "cartList의 수량" state가 업데이트 될 때마다로)
  useEffect(() => {
    setPriceTotal(getPriceTotalFromCartList(cartList));
    setIdSelectedItem(null);
    console.log(cartList);
  }, [idSelectedItem, cartList]);
  // 장바구니~

  return (
    <div className="App">
      {/* 상품목록 */}
      <Container className="mt-5" style={{ minWidth: "1000px" }}>
        <Row>
          <Col sm={8}>
            <h2>제품목록</h2>
            <Row className="g-5">
              <Col sm>
                <ListGroup className="itemList">
                  {shoesData?.map((data, index) => {
                    return (
                      <Card className="itemCard" key={data.id} style={{ width: "18rem" }}>
                        <Card.Img variant="top" src={`https://codingapple1.github.io/shop/shoes${data.id + 1}.jpg`} />
                        <Card.Body>
                          <Card.Title>{data.title}</Card.Title>
                          <Card.Text>{data.content}</Card.Text>
                          <Button variant="primary" onClick={() => addItemIntoCartList(data.id)}>
                            장바구니에 추가
                          </Button>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </ListGroup>
              </Col>
            </Row>
          </Col>

          {/* 장바구니 */}
          <Col className="cart" sm={4}>
            <h2>장바구니</h2>
            <ListGroup>
              {/* 상품명 */}
              <ListGroup.Item>
                <ul>
                  {cartList.length ? (
                    cartList.map((cartItem, index) => {
                      return (
                        <li key={cartItem.id} className="cartList">
                          <div className="cartItemCard">
                            <div className="text">
                              <strong className="cartItemTitle">{cartItem.title}</strong>
                              {cartItem.price}원
                            </div>
                            <CloseButton onClick={() => removeCartItem(cartItem.id)} />
                          </div>
                          <div className="itemInfoInList">
                            <Card.Img className="cartItemImage" variant="top" src={`https://codingapple1.github.io/shop/shoes${cartItem.id + 1}.jpg`} />

                            <strong>합계 : {getPriceComma(cartItem.price * cartItem.amount)} 원</strong>
                          </div>
                          <div>
                            <Button variant="primary" onClick={() => plusCartItemAmount(cartItem.id, false)}>
                              -
                            </Button>
                            <Button variant="light">{cartItem.amount}</Button>
                            <Button variant="primary" onClick={() => plusCartItemAmount(cartItem.id, true)}>
                              +
                            </Button>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <span>장바구니에 담긴 상품이 없습니다.</span>
                  )}
                </ul>
              </ListGroup.Item>

              <ListGroup.Item className="buy">
                {/* 토탈 */}
                <div className="buyInfo">
                  <strong className="totalPrice">총 액수 : {getPriceComma(priceTotal)}원</strong>
                  {cartList.length ? (
                    <Button className="clearCart" variant="danger" onClick={() => clearCartList()}>
                      장바구니 비우기
                    </Button>
                  ) : null}
                </div>

                <Button onClick={() => openBuyModal()} variant="primary">
                  구매하기
                </Button>
              </ListGroup.Item>
              <ListGroup.Item>드래거블존</ListGroup.Item>
            </ListGroup>
            {/* 모달창 */}
            <div className={`modal show infoModal ${isModalVisible ? "visible" : "invisible"}`} ref={refModal}>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Title>
                    <span className="modalTitle">개인정보입력</span>
                    <CloseButton onClick={() => setIsModalVisible(false)} />
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label>이름</Form.Label>
                      <Form.Control type="text" placeholder="이름" />
                      <Form.Text className="text-muted">영어, 5글자 이상, 특수기호 압수.</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <Form.Label>연락처</Form.Label>
                      <Form.Control type="tel" placeholder="000-0000-0000" />
                      <Form.Text className="text-muted">영어, 특수기호, 한글 압수.</Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="이벤트성 광고를 1시간마다 수신하지 않지 않지 않지 않지 않지 않지 않지 않지 않지 않겠습니다." />
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <div style={{ margin: "0 0 10px 10px" }}>총 액수 : {getPriceComma(priceTotal)}원</div>
                <Modal.Footer>
                  <Button variant="secondary">취소하기</Button>
                  <Button variant="primary">구매하기</Button>
                </Modal.Footer>
              </Modal.Dialog>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
