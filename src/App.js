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

function App() {
  const [shoesArray, setShoesArray] = useState(PRODUCT_DATA);
  const [number, setNumber] = useState(0);

  // ----- 데이터 불러오기 -----
  useEffect(() => {
    axios.get(`https://codingapple1.github.io/shop/data${2}.json`).then((result) => {
      setShoesArray([...shoesArray, ...result.data]);
    });
  }, []);

  // ----- 모달창 visible -----
  const [isModalVisible, setIsModalVisible] = useState(false);
  const refModal = useRef();

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

  // ----- 장바구니에 제품 추가하기 -----
  const [cartList, setCartList] = useState([]);
  const [idSelectedItem, setIdSelectedItem] = useState(null);
  const addItemIntoCartList = (id) => {
    // id와 같은 제품을 데이터에서 찾기
    setIdSelectedItem(id);
    const foundItemById = shoesArray.find((shoesData) => shoesData.id === id);

    // cartList 데이터 업데이트하기 (있으면 수량++, 없으면 상품목록에 추가)
    if (foundItemById.amount) {
      return (foundItemById.amount += 1);
    }
    foundItemById.amount = 1;
    setCartList([foundItemById, ...cartList]);
  };

  useEffect(() => {
    setIdSelectedItem(null);
  }, [idSelectedItem]);
  // ----- 장바구니에 제품 추가하기 -----

  return (
    <div className="App">
      {/* 상품목록 */}
      <Container className="mt-5">
        <Row>
          <Col sm={8}>
            <h2>제품목록</h2>
            <Row className="g-5">
              <Col sm>
                <ListGroup className="itemList">
                  {shoesArray?.map((data, index) => {
                    return (
                      <Card className="itemCard" key={data.id} style={{ width: "18rem" }}>
                        <Card.Img variant="top" src={`https://codingapple1.github.io/shop/shoes${index + 1}.jpg`} />
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
                  {cartList.map((itemInCart, index) => {
                    return (
                      <li key={index} className="cartList">
                        <strong>
                          {itemInCart.title}
                          <CloseButton />
                        </strong>
                        <div className="itemInfoInList">
                          <Card.Img className="cartItemImage" variant="top" src={`https://codingapple1.github.io/shop/shoes${index + 1}.jpg`} />

                          <strong>합계 : {itemInCart.price} 원</strong>
                        </div>
                        <div>
                          <Button variant="primary">-</Button>
                          <Button variant="light">{itemInCart.amount}</Button>
                          <Button variant="primary">+</Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ListGroup.Item>

              <ListGroup.Item className="buy">
                {/* 토탈 */}
                <strong>
                  Total : 000 원 <i>❌</i>
                </strong>
                <Button onClick={() => setIsModalVisible(true)} variant="primary">
                  구매하기
                </Button>
              </ListGroup.Item>
              <ListGroup.Item>드래거블존</ListGroup.Item>
            </ListGroup>
            <div className={`modal show infoModal ${isModalVisible ? "visible" : "invisible"}`} ref={refModal}>
              {/* 모달창 */}
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Title>
                    개인정보입력 <CloseButton onClick={() => setIsModalVisible(false)} />
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
