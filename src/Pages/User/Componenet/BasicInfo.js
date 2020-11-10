import React, { useState } from 'react';
import styled from 'styled-components';
import ImgBox from '../../../Components/ImgBox/ImgBox';
import { FaUserAlt } from 'react-icons/fa';
import { AiOutlineWarning } from 'react-icons/ai';

function BasicInfo({ sellerInfo }) {
  const [modalVisible, setModalVisible] = useState(false);

  //profile img upload
  const [profileImgBase64, setProfileImgBase64] = useState(''); // 업로드 될 이미지
  const [profileImgFile, setProfileImgFile] = useState(null); // 파일 전송을 위한 state

  const handleChangeFile = (event) => {
    let reader = new FileReader();

    reader.onloadend = (e) => {
      // 2. 읽기가 완료되면 아래 코드 실행
      const base64 = reader.result;
      if (base64) {
        // 파일 base64 상태 업데이트
        setProfileImgBase64(base64.toString());
      }
    };
    if (event.target.files[0]) {
      // 1. 파일을 읽어 버퍼에 저장
      reader.readAsDataURL(event.target.files[0]);
      // 파일 상태 업데이트
      setProfileImgFile(event.target.files[0]);
      console.log(imgFile);
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const { identification, seller_name_en } = sellerInfo;
  const imgId = 'profileImg';

  return (
    <BasicInfoBox>
      <InfoTitle>
        <FaUserAlt />
        <p>기본정보</p>
      </InfoTitle>
      <InfoBody>
        <Table>
          <tbody>
            <tr>
              <td>
                셀러 프로필 <span>*</span>
              </td>
              <td>
                {/* ImgBox component에 props로 전달해 줄 값 */}
                <ImgBox
                  boxWidth='130px'
                  boxHeight='100px'
                  imgWidth='90px'
                  imgHeight='90px'
                  imgId={imgId}
                />
                <ExtraInfo>
                  <AiOutlineWarning />
                  <p>
                    셀러 프로필 확장자는 <b>jpg, jpeg, png </b>만 가능하며, 허용
                    가능한 최대 파일사이즈 크기는 <b>5MB</b> 입니다.
                  </p>
                </ExtraInfo>
              </td>
            </tr>
            <tr>
              <td>셀러상태</td>
              <td>입점</td>
            </tr>
            <tr>
              <td>셀러 영문명</td>

              <td>{seller_name_en}</td>
            </tr>
            <tr>
              <td>셀러계정</td>
              <td>
                {identification}
                <button onClick={openModal}>비밀번호 변경하기</button>
                {/* <PasswordModal visible={modalVisible} onClose={closeModal} /> */}
              </td>
            </tr>
          </tbody>
        </Table>
      </InfoBody>
    </BasicInfoBox>
  );
}

export default BasicInfo;

const BasicInfoBox = styled.div`
  margin-bottom: 25px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const InfoTitle = styled.div`
  display: flex;
  height: 38px;
  padding: 10px 10px 2px 10px;
  background-color: #eee;
  font-size: 13px;
  svg {
    margin-right: 5px;
    width: 13px;
    height: 13px;
  }
`;

const InfoBody = styled.div`
  padding: 10px;
  span {
    color: red;
  }
  button {
    margin-left: 5px;
    padding: 1px 5px;
    font-size: 12px;
    border-radius: 3px;
    background-color: #d9534f;
    color: #fff;
    cursor: pointer;
  }
`;

const Table = styled.table`
  width: 100%;
  border: 1px solid #ddd;
  line-height: 1.5;
  border-collapse: collapse;
  font-size: 13px;
  tbody {
    vertical-align: middle;
    tr {
      &:nth-child(odd) {
        background-color: #f9f9f9;
      }
    }
    th,
    td {
      border: 1px solid #ddd;
    }
    td {
      padding: 8px;
      vertical-align: middle;
      &:first-child {
        width: 252px;
      }
    }
  }
`;

const ImgUpload = styled.div``;

const ImgPreview = styled.div`
  width: 130px;
  height: 100px;
  vertical-align: middle;
  text-align: center;
  border: 1px solid #eee;
  background-color: #fff;
  img {
    width: 90px;
    height: 90px;
  }
`;

const BaseImg = styled.img`
  width: 90px;
  height: 90px;
`;

const ImgAdd = styled.div`
  margin-bottom: 20px;
  label {
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
    background-color: #fff;
  }
  input {
    margin-top: 15px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;

const ExtraInfo = styled.div`
  ${({ theme }) => theme.flex(null, 'center')}
  margin-top: 10px;
  color: #1e90ff;
  svg {
    margin-right: 5px;
  }
`;

const MiniTable = styled.table`
  width: 100%;
  text-align: left;
  th {
    padding: 8px;
    background-color: #eeeeee;
    font-size: 14px;
  }
`;
