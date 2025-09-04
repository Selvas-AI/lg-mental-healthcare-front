import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { clientsState } from '@/recoil';
import { clientUpdate, clientCreate, clientFind, clientUpdateMemo } from '@/api/apiCaller';

// 내담자 등록/수정 관리 커스텀 훅
export const useClientManager = () => {
  const [clients, setClients] = useRecoilState(clientsState);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const saveClient = async (clientData, editClient = null, additionalUpdates = null) => {
    try {
      if (editClient) {
        // 내담자 정보 수정 - 변경된 필드만 전송
        const updateData = { clientSeq: editClient.clientSeq };
        
        // 필드 매핑 및 변환
        const newBirthDate = `${clientData.birthYear}${clientData.birthMonth.padStart(2, '0')}${clientData.birthDay.padStart(2, '0')}`;
        const newGender = clientData.gender === 'female' ? 'F' : clientData.gender === 'male' ? 'M' : clientData.gender;
        const newEmail = clientData.emailId && clientData.emailDomain ? `${clientData.emailId}@${clientData.emailDomain}` : '';
        
        // 변경된 필드만 추가
        const fieldMappings = [
          { key: 'clientName', newVal: clientData.name, oldVal: editClient.clientName },
          { key: 'nickname', newVal: clientData.nickname || '', oldVal: editClient.nickname || '' },
          { key: 'birthDate', newVal: newBirthDate, oldVal: editClient.birthDate },
          { key: 'gender', newVal: newGender, oldVal: editClient.gender },
          { key: 'contactNumber', newVal: clientData.phoneNumber, oldVal: editClient.contactNumber },
          { key: 'address', newVal: clientData.address || '', oldVal: editClient.address || '' },
          { key: 'email', newVal: newEmail, oldVal: editClient.email || '' },
          { key: 'job', newVal: clientData.job || '', oldVal: editClient.job || '' },
          { key: 'memo', newVal: clientData.memo || '', oldVal: editClient.memo || '' }
        ];
        
        fieldMappings.forEach(({ key, newVal, oldVal }) => {
          if (newVal !== oldVal) {
            updateData[key] = newVal;
          }
        });
        
        // 보호자 정보 변경 확인 (의미있는 데이터만 비교)
        const hasValidGuardianData = (guardians) => {
          if (!Array.isArray(guardians) || guardians.length === 0) return false;
          return guardians.some(g => g.guardianRelation || g.guardianName || g.guardianContact);
        };
        
        const currentHasGuardians = hasValidGuardianData(editClient.guardian);
        const newHasGuardians = hasValidGuardianData(clientData.guardians);
        
        // 의미있는 보호자 데이터가 변경된 경우만 전송
        if (currentHasGuardians !== newHasGuardians || 
            (newHasGuardians && JSON.stringify(editClient.guardian || []) !== JSON.stringify(clientData.guardians || []))) {
          updateData.guardian = newHasGuardians ? clientData.guardians : null;
        }
        
        const response = await clientUpdate(updateData);
        if (response.code === 200) {
          // 내담자 정보 수정 후 clientFind로 해당 내담자만 최신 데이터로 동기화
          try {
            const findResponse = await clientFind({ clientSeq: editClient.clientSeq });
            if (findResponse.code === 200 && findResponse.data) {
              // clients 상태 업데이트
              setClients(prevClients => 
                prevClients.map(client => 
                  client.clientSeq === editClient.clientSeq 
                    ? findResponse.data
                    : client
                )
              );
              
              // 추가 업데이트 함수가 있으면 실행 (예: ClientList 데이터 업데이트)
              if (additionalUpdates?.updateClientList) {
                additionalUpdates.updateClientList(findResponse.data);
              }
            }
          } catch (refreshError) {
            // 실패 시 로컬 데이터로 폴백
            const updatedClient = { ...editClient, ...updateData };
            setClients(prevClients => 
              prevClients.map(client => 
                client.clientSeq === editClient.clientSeq 
                  ? updatedClient
                  : client
              )
            );
            
            if (additionalUpdates?.updateClientList) {
              additionalUpdates.updateClientList(updatedClient);
            }
          }
          showToastMessage('내담자 정보가 수정되었습니다.');
          return { success: true, data: response.data };
        } else {
          showToastMessage(response?.message || '내담자 정보 수정에 실패했습니다.');
          return { success: false, message: response?.message };
        }
      } else {
        // 내담자 등록
        // 닉네임 필수 검증 (가입 시)
        if (!clientData.nickname || clientData.nickname.trim().length === 0) {
          showToastMessage('닉네임은 필수 입력값입니다.');
          return { success: false, message: '닉네임 누락' };
        }
        // 보호자 데이터 정리: 의미 있는 값이 하나도 없으면 null, 있으면 유효 항목만 전송
        const hasValidGuardianData = (guardians) => {
          if (!Array.isArray(guardians) || guardians.length === 0) return false;
          return guardians.some(g => (g?.guardianRelation || g?.guardianName || g?.guardianContact));
        };
        const cleanedGuardians = Array.isArray(clientData.guardians)
          ? clientData.guardians.filter(g => g && (g.guardianRelation || g.guardianName || g.guardianContact))
          : [];

        const registerData = {
          clientName: clientData.name,
          nickname: clientData.nickname || '',
          birthDate: `${clientData.birthYear}${clientData.birthMonth.padStart(2, '0')}${clientData.birthDay.padStart(2, '0')}`,
          gender: clientData.gender === 'female' ? 'F' : clientData.gender === 'male' ? 'M' : clientData.gender,
          contactNumber: clientData.phoneNumber,
          address: clientData.address || '',
          email: clientData.emailId && clientData.emailDomain ? `${clientData.emailId}@${clientData.emailDomain}` : '',
          job: clientData.job || '',
          guardian: hasValidGuardianData(clientData.guardians) ? cleanedGuardians : null,
          memo: clientData.memo || ''
        };
        
        const response = await clientCreate(registerData);
        const createCode = typeof response?.code === 'string' ? parseInt(response.code, 10) : response?.code;
        if (createCode === 200) {
          // 등록 직후 서버에서 생성된 필드 포함한 최신 데이터로 재조회
          let createdClient = response.data;
          try {
            if (createdClient?.clientSeq) {
              const findResponse = await clientFind({ clientSeq: createdClient.clientSeq });
              if (findResponse.code === 200 && findResponse.data) {
                createdClient = findResponse.data;
              }
            }
          } catch (e) {
            // 재조회 실패 시, 응답 데이터로 대체
          }

          // clients 상태에 병합(동일 clientSeq 존재 시 교체, 없으면 추가)
          setClients(prevClients => {
            const clientSeqVal = createdClient && createdClient.clientSeq;
            if (clientSeqVal) {
              const exists = prevClients.some(c => c && c.clientSeq === clientSeqVal);
              if (exists) {
                return prevClients.map(c => (c && c.clientSeq === clientSeqVal) ? createdClient : c);
              }
              return [...prevClients, createdClient];
            }
            // clientSeq가 없거나 createdClient가 null인 경우: null 제거 후 단순 추가
            const safePrev = prevClients.filter(Boolean);
            return createdClient ? [...safePrev, createdClient] : safePrev;
          });

          // 추가 업데이트 함수가 있으면 최신 데이터로 전달
          if (additionalUpdates?.addToClientList) {
            additionalUpdates.addToClientList(createdClient);
          }

          showToastMessage('내담자가 등록되었습니다.');
          return { success: true, data: createdClient };
        } else {
          showToastMessage(response?.message || '내담자 등록에 실패했습니다.');
          return { success: false, message: response?.message };
        }
      }
    } catch (error) {
      console.error('내담자 저장 오류:', error);
      showToastMessage('처리 중 오류가 발생했습니다.');
      return { success: false, error };
    }
  };

  const saveMemo = async (clientId, memoValue, additionalUpdates = null) => {
    try {
      const response = await clientUpdateMemo({
        clientSeq: parseInt(clientId),
        memo: memoValue
      });
      
      if (response.code === 200) {
        // 성공 시 로컬 상태 업데이트
        setClients(prevClients => 
          prevClients.map(client => 
            client.clientSeq === parseInt(clientId) 
              ? { ...client, memo: memoValue }
              : client
          )
        );
        
        // 추가 업데이트 함수가 있으면 실행 (예: ClientList 데이터 업데이트)
        if (additionalUpdates?.updateClientList) {
          additionalUpdates.updateClientList(parseInt(clientId), memoValue);
        }
        
        showToastMessage('내담자 메모가 저장되었습니다.');
        return { success: true, data: response.data };
      } else {
        showToastMessage(response.message || '메모 저장에 실패했습니다.');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('메모 저장 오류:', error);
      showToastMessage('메모 저장 중 오류가 발생했습니다.');
      return { success: false, error };
    }
  };

  return {
    clients,
    saveClient,
    saveMemo,
    toastMessage,
    showToast,
    showToastMessage
  };
};
