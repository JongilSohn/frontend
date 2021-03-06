import React, { Fragment, useState, useEffect } from 'react';
import regeneratorRuntime from 'regenerator-runtime';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import dateFormatChange from '../../Components/ChangeTimeFormat';
import { isMaster, saveNav, saveFilter } from '../../Store/Reducer/userInfo';
import baseInfo from '../../Components/BaseInfo';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import ProductDetail from './Components/ProductDetail';
import Nav from '../../Components/Nav/Nav';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import FiltersContainer from './Components/FiltersContainer';
import { API } from '../../config';

export default function ProductManagement() {
  // 로딩창 관리
  const [isLoading, setIsLoading] = useState(true);
  // 디스패치, 히스토리 선언
  const dispatch = useDispatch();
  const history = useHistory();
  // 여러번 렌더되는 것을 막기위한 상태값
  const [isMounted, setIsMounted] = useState(false);
  // 공통으로 사용되는 데이터를 관리
  const [product, setProduct] = useState();
  // 리덕스에서 가져온 필터를 상태로 관리
  const [filters, setFilters] = useState({});
  // 현재 선택 날짜
  const [currentDate, setCurrentDate] = useState({
    startDate: '',
    endDate: '',
  });
  // 현재 페이지 관리
  const [activePage, setActivePage] = useState(1);
  // 셀러명 검색
  const [sellerName, setSellerName] = useState(null);
  // 상품검색 필터 설정 후 검색
  const [selectBox, setSelectBox] = useState({
    select: null,
    search: null,
  });
  // limit 관리
  const [limit, setLimit] = useState(10);
  // 현재 눌린 버튼, 눌린 버튼의 id 상태
  const [btnFilter, setBtnFilter] = useState();

  const sellerNameId = 'seller_name';
  const attributeId = 'attribute';
  const salesId = 'sale';
  const displayId = 'display';

  // store에 저장되어 있는 filter_list를 가져온다.
  const { filter_list, nav_list } = useSelector(({ userInfo }) => ({
    filter_list: userInfo.filter_list,
    nav_list: userInfo.nav_list,
  }));

  // 조회기간 시작 날짜 필터
  const handleEndDate = (date) => {
    setCurrentDate({ ...currentDate, endDate: date });
  };

  // 조회기간 끝나는 날짜 필터
  const handleStartDate = (date) => {
    setCurrentDate({ ...currentDate, startDate: date });
  };

  // 셀러명 검색 필터
  const handleSellerName = (e) => {
    setSellerName(e.target.value);
  };

  // 상품검색 필터
  const hadleSelectSearch = (e) => {
    const { name, value } = e.target;

    setSelectBox({
      ...selectBox,
      [name]: value,
    });
  };

  // 길이별로 boolean 값 생성
  const createBoolean = (length) => {
    return new Array(length)
      .fill()
      .map((_, index) => (index === 0 ? true : false));
  };

  // 각 필터별로 선택되었을때 담을 id, boolean 상태 생성
  const createFilter = (filter) => {
    setBtnFilter(
      filter
        .map((el) => {
          return {
            [el.id]: null,
            [`${el.id}Selected`]: createBoolean(
              el.category && el.category.length
            ),
          };
        })
        .reduce((acc, filter) => {
          return {
            ...acc,
            ...filter,
          };
        }, '')
    );
  };

  // 버튼 필터가 선택되었을 때,
  const handleBtnFilter = (mainId, subId, idx) => {
    const changeSelected = (mainId) => {
      // 다중 선택 필터인 경우,
      if (mainId === attributeId) {
        const result = btnFilter[`${mainId}Selected`].map((el, index) => {
          return index === idx ? !el : el;
        });

        // 다중 선택일 경우, 배열에 선택된 필터값을 담아놓는다.
        const selectedId = () => {
          const addId = !btnFilter[mainId] ? [subId] : btnFilter[mainId];

          // 배열로 현재 선택된 필터값을 관리
          if (!btnFilter[mainId]) {
            return [subId];
          } else if (addId.includes(subId)) {
            return addId.filter((el) => {
              return el !== subId;
            });
          } else {
            return [...addId].concat(subId);
          }
        };

        if (idx !== 0) {
          result[0] = false;
          return { id: selectedId(), selected: result };
        }

        return { id: selectedId(), selected: result };
      }

      // 단일 선택 필터인 경우,
      else {
        const result = btnFilter[`${mainId}Selected`].map((el, index) => {
          return index === idx ? !el : false;
        });
        return { id: subId, selected: result };
      }
    };

    // 모든 버튼이 눌렸을 경우,
    const allSelected = changeSelected(mainId)
      .selected.slice(1)
      .every((item) => {
        return item;
      });

    // 모든 버튼이 눌리지 않았을 때,
    const allNotSelected = changeSelected(mainId)
      .selected.slice(1)
      .every((item) => {
        return !item;
      });

    // 전체 버튼 선택
    if (
      changeSelected(mainId).selected[0] ||
      !!allSelected ||
      !!allNotSelected
    ) {
      return changeBtnFilter(
        mainId,
        null,
        createBoolean(btnFilter[`${mainId}Selected`].length)
      );
    }

    // 상태를 변경할, 필터 이름, id, 현재 선택한 boolean값을 인자로 넣어서 현재 필터의 상태 변경
    changeBtnFilter(
      mainId,
      changeSelected(mainId).id,
      changeSelected(mainId).selected
    );
  };

  // 필터의 상태 변경
  const changeBtnFilter = (mainId, id, selected) => {
    setBtnFilter({
      ...btnFilter,
      [mainId]: id,
      [`${mainId}Selected`]: selected,
    });
  };

  // 리셋시 상태 초기화
  const resetFilter = () => {
    createFilter(filter_list);
    setCurrentDate({
      startDate: '',
      endDate: '',
    });
    setSellerName(null);
    setSelectBox({
      select: null,
      search: null,
    });
    getData();
  };

  // 상품 리스트에 출력할 Data를 서버에서 요청하여 받아옵니다.
  const getData = async (param = null) => {
    const localToken = localStorage.getItem('token');
    let stime = new Date().getTime();

    setIsLoading(true);

    try {
      const result = await axios.get(`${API}/product`, {
        params: param,
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: localToken,
        },
        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
        validateStatus: function (status) {
          return status < 500;
        },
      });

      // 리덕스에 필터 정보가 없을 경우,
      if (!filter_list[0]) {
        const response = await baseInfo();

        dispatch(saveFilter(response.filter_list));
        dispatch(saveNav(response.nav_list));
        dispatch(isMaster(response.is_master));
      }

      // 통신에 성공했을 경우,
      if (result.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
        }, 300 - (new Date().getTime() - stime));

        // 공통으로 사용하는 데이터
        const filterList = {
          filter_list: filter_list.filter((el) => el.id !== sellerNameId),
        };
        setFilters(filterList);

        // 상품리스트를 저장
        const DataProductManage = result.data.success;

        setProduct(DataProductManage);

        if (DataProductManage.total_product === 0) {
          alert('검색 결과가 없습니다.');
          resetFilter();
        }
      } else {
        alert(result.data.client_message);
        history.push('/');
      }
    } catch (err) {
      if (err.response) {
        // 토큰의 정보가 바뀌었다면, 백엔드에서 받은 message 팝업창 출력
        if (err.response.statusText === 'UNAUTHORIZED') {
          alert(err.response.data.client_message);
          history.push('/');
        }
      } else if (err.request) {
        alert('서버에서 응답이 없습니다.', err.request);
        history.push('/');
      }
    }
  };

  // 페이지 언마운트시 실행
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 페이지 언마운트 완료 후 실행
  useEffect(() => {
    createFilter(filter_list);

    if (isMounted) {
      getData();
    }
  }, [filter_list, nav_list]);

  // 검색 버튼일 눌리게 되면 동작할 함수.
  const sendData = () => {
    // 상태로 저장하고 있던 값을 params로 보내기 위해 data form 변경
    const queryString = {
      until: dateFormatChange(currentDate.endDate) || null,
      from: dateFormatChange(currentDate.startDate) || null,
      seller_name: sellerName || null,
      [`${selectBox.select}`]: selectBox.search,
      attribute:
        (btnFilter &&
          btnFilter['attribute'] &&
          btnFilter['attribute'].reduce((acc, el) => {
            return acc ? acc + ',' + el : acc + el;
          })) ||
        null,
      sale: btnFilter && btnFilter['sale'] !== '' ? btnFilter['sale'] : null,
      displayed:
        btnFilter && btnFilter['display'] !== '' ? btnFilter['display'] : null,
      discount:
        btnFilter && btnFilter['discount'] !== ''
          ? btnFilter['discount']
          : null,
      offset: (activePage - 1) * limit !== 0 ? (activePage - 1) * limit : null,
      limit: Number(limit) !== 10 ? limit : null,
    };

    //변경된 form을 param에 넣어 get Data
    setIsLoading(false);
    getData(queryString);
  };

  // 검색버튼을 눌렀을 때 실행되는 함수
  const handleSearch = () => {
    sendData();
    setActivePage(1);
  };

  return (
    <Fragment>
      <Header />
      <Main>
        <Nav />
        <Section>
          <h3>상품 관리</h3>
          <FiltersContainer
            currentDate={currentDate}
            handleStartDate={handleStartDate}
            handleEndDate={handleEndDate}
            filters={filters}
            handleSearch={handleSearch}
            sellerName={sellerName}
            handleSellerName={handleSellerName}
            selectBox={selectBox}
            hadleSelectSearch={hadleSelectSearch}
            btnFilter={btnFilter}
            handleBtnFilter={handleBtnFilter}
            resetFilter={resetFilter}
          />
          <ProductDetail
            setIsLoading={setIsLoading}
            isLoading={isLoading}
            product={product}
            setProduct={setProduct}
            setLimit={setLimit}
            limit={limit}
            activePage={activePage}
            setActivePage={setActivePage}
            filters={filters}
            sendData={sendData}
            salesId={salesId}
            displayId={displayId}
          />
        </Section>
      </Main>
      <Footer />
    </Fragment>
  );
}

const Main = styled.div`
  display: flex;
  width: 100%;
`;

const Section = styled.div`
  width: 100%;
  padding: 20px 20px;
  margin-top: 45px;
  border-radius: 0 0 0 4px;
  background-color: #fafafa;

  h3 {
    font-size: 26px;
    margin-bottom: 15px;
    font-weight: 300;
    color: #666;
  }
`;
