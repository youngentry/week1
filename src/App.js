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

  const clearModalInput = () => {
    setName("");
    setPhoneNumber("");
  };

  const [modalStage, setModalStage] = useState(0);

  useEffect(() => {
    // 모달이 열려 있고 모달의 바깥쪽을 눌렀을 때 창 닫기
    const clickOutside = (e) => {
      if ((isModalVisible && !refModal.current.contains(e.target)) || !isModalVisible) {
        setIsModalVisible(false);
        clearModalInput();
        setModalStage(0);
      }
    };
    document.addEventListener("mousedown", clickOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [isModalVisible]);
  // ----- 모달창 visible -----

  // ~~~~~장바구니~~~~~
  // ----- 장바구니에 제품 추가하기 -----
  const [cartList, setCartList] = useState([]);
  const [idSelectedItem, setIdSelectedItem] = useState(null);
  const addItemIntoCartList = (id) => {
    // id와 같은 제품을 데이터에서 찾기
    setIdSelectedItem(id);

    const itemFoundByIdFromShoesData = shoesData.find((shoes) => shoes.id === id);
    console.log(itemFoundByIdFromShoesData, id);
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
  // ~~~~~장바구니~~~~~

  // ~~~~~개인정보입력~~~~~
  const [name, setName] = useState("");

  // ----- 이름 입력에 한글만 허용하기 -----
  const checkName = (name) => {
    // ^:첫문자부터 $:끝문자까지 *:공백을 포함하여 1회 이상
    const checkKorean = /^[ㄱ-ㅎ|가-힣]*$/;
    if (!checkKorean.test(name)) {
      window.alert(`잘못된 입력입니다. "${name.slice(-1)}"`);
      return name.slice(0, name.length - 1);
    }

    return name;
  };
  // ----- 이름 입력에 한글만 허용하기 -----

  const [phoneNumber, setPhoneNumber] = useState("");

  // ----- 휴대폰 번호 입력에 숫자만 허용하기 -----
  const checkPhoneNumber = (phoneNumber) => {
    const checkNumber = /^[0-9]*$/;
    if (!checkNumber.test(phoneNumber)) {
      window.alert(`잘못된 입력입니다. "${phoneNumber.slice(-1)}"`);
      return phoneNumber.slice(0, phoneNumber.length - 1);
    }

    return phoneNumber;
  };
  // ----- 휴대폰 번호 입력에 숫자만 허용하기 -----

  // ----- 제출 시 입력값 검사하기 -----
  // input 창이 비어있으면 다음단계로 넘어가지 않고 focus 해주도록 함
  const nameInputRef = useRef();
  const phoneInputRef = useRef();

  const isValidateInfo = () => {
    if (name === "") {
      window.alert("이름을 입력해주세요.");
      return nameInputRef.current.focus();
    }
    if (phoneNumber.length < 10) {
      window.alert("올바른 전화번호를 입력해주세요. : 10자리 미만");
      return phoneInputRef.current.focus();
    }
    return true;
  };
  // ----- 제출 시 입력값 검사하기 -----
  // ~~~~~개인정보입력~~~~~

  // ----- 모달창 다음 단계로 넘기기 -----
  const flipModalStage = (validateInput, stage) => {
    const validation = validateInput();
    if (validation) {
      setModalStage(stage + 1);
    }
  };
  // ----- 모달창 다음 단계로 넘기기

  return (
    <div className="App">
      <Container className="mt-5 product" style={{ minWidth: "1000px" }}>
        {/* 상품목록 */}
        <Row>
          <Col sm={8}>
            <h2>제품목록</h2>
            <Row className="g-5">
              <Col sm>
                <ListGroup className="itemList">
                  {shoesData?.map((data, index) => {
                    return (
                      <Card className="itemCard" data-id={data.id} key={data.id} style={{ width: "18rem" }} onDragStart={(e) => e.dataTransfer.setData("id", data.id)} draggable="true">
                        <Card.Img variant="top" src={`https://codingapple1.github.io/shop/shoes${data.id + 1}.jpg`} draggable="false" />
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
              <ListGroup.Item
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  let productId = parseInt(e.dataTransfer.getData("id"));
                  addItemIntoCartList(productId);
                }}
              >
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
                    <div>
                      <div>장바구니에 담긴 상품이 없습니다.</div>
                      <br />
                      <div>"장바구니에 추가"버튼 클릭하여 추가</div>
                      <div>"제품 이미지를 드래그"하여 장바구니로 끌어와 장바구니에 추가</div>
                    </div>
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

                <Button
                  onClick={() => {
                    openBuyModal();
                    setModalStage(1);
                  }}
                  variant="primary"
                >
                  구매하기
                </Button>
              </ListGroup.Item>
              <ListGroup.Item>드래거블존</ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
        {/* 모달창 */}
        <div className={`modalBox  ${isModalVisible ? "visible" : "invisible"}`} ref={refModal}>
          <div className={`modal show infoModal ${modalStage === 1 ? "stageVisible" : "stageInvisible"}`}>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title className="modalTitleBox">
                  <span className="modalTitle">개인정보입력</span>
                  <CloseButton onClick={() => setIsModalVisible(false)} />
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>이름</Form.Label>
                    <Form.Control type="text" placeholder="이름" maxLength={4} onChange={(e) => setName(checkName(e.target.value))} value={name} ref={nameInputRef} />
                    <Form.Text className="text-muted">영어, 5글자 이상, 특수기호 압수.</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>연락처</Form.Label>
                    <Form.Control type="tel" placeholder="000-0000-0000" maxLength={11} onChange={(e) => setPhoneNumber(checkPhoneNumber(e.target.value))} value={phoneNumber} ref={phoneInputRef} />
                    <Form.Text className="text-muted">영어, 특수기호, 한글 압수.</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="이벤트성 광고를 1시간마다 수신하지 않지 않지 않지 않지 않지 않지 않지 않지 않지 않겠습니다." />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <div style={{ margin: "0 0 10px 10px" }}>총 액수 : {getPriceComma(priceTotal)}원</div>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setIsModalVisible(false)}>
                  취소하기
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    flipModalStage(isValidateInfo, modalStage);
                  }}
                >
                  다음으로
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
          <div className={`modal show receiptModal ${modalStage === 2 ? "stageVisible" : "stageInvisible"}`}>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title className="modalTitleBox">
                  <span className="modalTitle">영수증</span>
                  <CloseButton onClick={() => setIsModalVisible(false)} />
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>{`${new Date()}`}</div>
                <div>
                  {cartList.map((cartItem) => {
                    return (
                      <div>
                        <strong>
                          {cartItem.title} {cartItem.amount}개 {cartItem.price * cartItem.amount}원
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </Modal.Body>

              <Modal.Footer>
                <h3>총 액수 : {getPriceComma(priceTotal)}원</h3>
                <Button variant="secondary" onClick={() => setModalStage(1)}>
                  이전으로
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsModalVisible(false);
                    clearCartList();
                    window.alert("성공적으로 결제되었습니다.");
                  }}
                >
                  결제하기
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;
