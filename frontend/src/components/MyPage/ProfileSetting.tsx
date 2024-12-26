import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';

import apiClient from './../../utils/util';
import useNotificationStore from '@/store/notificationParticipant';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useUserStore from '@/store/useUserStore';
import Loading from '../common/Loading';
import useAuthStore from '@store/useAuthStore';
import useCompanyStore from '@/store/useCompanyStore';

import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

const Button = lazy(() => import('./Button'));
const CompanySearch = lazy(() => import('../CompanyPage/CompanySearch'));
const MdEdit = lazy(() => import('react-icons/md').then((module) => ({ default: module.MdEdit })));

interface MeetingDetails {
  id: number;
  interviewId: string;
}

interface Experience {
  companyName: string;
  companyId: string;
  startDate: string;
  endDate: string;
  department: string;
  isCurrentlyWorking: boolean;
}

interface UserProfile {
  email: string | null;
  name: string;
  profileImg: string | null;
  role: string | null;
  temperature: number | null;
}

interface MentorInfo {
  selfProduce: string;
  fileUrl: string;
  careers: Array<{
    companyName: string;
    department: string;
    startedDate: string;
    endedDate: string;
  }>;
}

interface MentorProfile extends UserProfile {
  mentorInfo: MentorInfo;
}

const isMentorProfile = (profile: UserProfile): profile is MentorProfile => {
  return profile.role === 'MENTOR';
};

// const ProfileSetting = ({ onUpdateUserData }) => {
const ProfileSetting = () => {
  const FILE_SIZE_MAX_LIMIT = 1 * 1024 * 1024;
  const [editMode, setEditMode] = useState(false);
  // const [editMentoMode, setEditMentoMode] = useState(false);
  // const { addParticipant } = useParticipantsStore();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newTemperature, setNewTemperature] = useState<number>(0);
  const [memberEmail, setMemberEmail] = useState<string>('');

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [canCreateRoom, setCanCreateRoom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [memberId, setMemberId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  // const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [introduction, setIntroduction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  // const { notifications, checkNotification } = useNotificationStore();
  const { checkNotification } = useNotificationStore();
  const navigate = useNavigate();
  // const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>();
  const [mentoCertification, setMentoCertification] = useState(false);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState<Experience>({
    companyName: '',
    companyId: '',
    startDate: '',
    endDate: '',
    department: '',
    isCurrentlyWorking: false,
  });
  const [fileText, setFileText] = useState<File | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const { logout } = useAuthStore((state) => ({
    logout: state.logout,
  }));
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');

  const { companies } = useCompanyStore();

  const getCompanyId = (companyName: string) => {
    const company = companies.find((c) => c.name === companyName);
    return company ? company.id : null;
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const temperature = useUserStore((state) => state.temperature);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const files = (target.files as FileList)[0];
    if (files === undefined) {
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(files.type)) {
      target.value = '';
      MySwal.fire({
        html: `<b>PDF 또는 DOCX 파일만 업로드 가능합니다.</b>`,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: '확인',
      });
      return;
    }

    if (files.size > FILE_SIZE_MAX_LIMIT) {
      target.value = '';
      MySwal.fire({
        html: `<b>업로드 가능한 최대 용량은 1MB입니다.</b>`,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: '확인',
      });
      return;
    }

    setFileText(files);
  };

  const handleRemoveFile = () => {
    setFileText(null);
  };

  // const [resumeFilePreview, setResumeFilePreview] = useState(null);

  const handleDeleteExperience = (index: number) => {
    setExperience(experience.filter((_, expIndex) => expIndex !== index));
  };

  // const getToken = async (sessionId: string) => {
  //   try {
  //     const tokenResponse = await apiClient.post(`/meeting/sessions/${sessionId}/connections`);
  //     return tokenResponse.data;
  //   } catch (error) {
  //     console.error('Error creating token:', error);
  //     throw error;
  //   }
  // };

  // async function fetchMeetingBySessionId(sessionId: string): Promise<MeetingDetails | undefined> {
  //   try {
  //     const response = await apiClient.get(`/meeting/sessions/${sessionId}`);
  //     const meetingDto = response.data;

  //     console.log('Meeting details:', meetingDto.id);
  //     console.log(meetingDto.interviewId);

  //     return {
  //       id: meetingDto.id,
  //       interviewId: meetingDto.interviewId,
  //     };
  //   } catch (error) {
  //     console.error('Error fetching meeting details:', error);
  //     return undefined;
  //   }
  // }

  // const EnterParticipant = async (
  //   meetingId: number,
  //   participant: Participant
  // ): Promise<Participant> => {
  //   try {
  //     const response = await apiClient.post<Participant>(
  //       `/participants/meetings/${meetingId}`,
  //       participant
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error adding participant:', error);
  //     throw error;
  //   }
  // };

  // const handleCreateSession = async (sessionId: string | undefined) => {
  //   if (sessionId === undefined) {
  //     console.error('세션 ID가 정의되지 않았습니다.');
  //     return;
  //   }
  //   try {
  //     const token = await getToken(sessionId);

  //     const meetingDetails = await fetchMeetingBySessionId(sessionId);

  //     if (meetingDetails) {
  //       const { id: roomId, interviewId } = meetingDetails;
  //       const participant: Participant = {
  //         memberId: memberId,
  //         name: newName,
  //         role: 'mentee',
  //         isMuted: false,
  //         isCameraOn: false,
  //       };
  //       console.log(participant);

  //       await EnterParticipant(roomId, participant);

  //       // addParticipant({
  //       //   id: memberId,
  //       //   sessionId,
  //       //   meetingId: roomId,
  //       //   token,
  //       //   userName: newName,
  //       //   isHost: false,
  //       //   isMicroOn: false,
  //       //   isCameraOn: false,
  //       // });

  //       // navigate('/video-chat');

  //       navigate('/video-chat', {
  //         state: {
  //           id: memberId,
  //           sessionId,
  //           meetingId: roomId,
  //           interviewId: interviewId,
  //           token,
  //           userName: newName,
  //           isHost: false,
  //           isMicroOn: false,
  //           isCameraOn: false,
  //           enter: true,
  //         },
  //       });
  //     } else {
  //       console.error('Failed to fetch meeting details.');
  //     }
  //   } catch (error) {
  //     console.error('세션 생성 중 오류 발생:', error);
  //     throw error;
  //   }
  // };

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const memberResponse = await apiClient.get('/mypage');
        console.log(memberResponse.data);
        const members: UserProfile = memberResponse.data;
        if (members) {
          setProfileData(members);
          setMemberEmail(members.email ?? '');
          setNewEmail(members.email ?? '');
          setNewName(members.name ?? '');
          setNewTemperature(members.temperature ?? 0);
          if (isMentorProfile(members)) {
            setIntroduction(members.mentorInfo.selfProduce || '');
          }
          if (members.email !== null && members.email !== '') {
            setEmailDomain(members.email.split('@')[1]);
          }
        }
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, []);

  // useEffect(() => {
  //   const fetchMemberData = async () => {
  //     if (!memberEmail) return;
  //     try {
  //       const memberResponse = await apiClient.get('/members/search', {
  //         params: { email: memberEmail },
  //       });

  //       const memberData = memberResponse.data;
  //       const memberIdFromResponse = memberData.id;
  //       console.log(memberIdFromResponse);
  //       setMemberId(memberIdFromResponse);

  //       if (memberIdFromResponse) {
  //         const sessionResponse = await apiClient.get(
  //           `/meeting-notifications/sessions/member/${memberIdFromResponse}`
  //         );
  //         const sessionIdFromResponse = sessionResponse.data;
  //         console.log(sessionIdFromResponse);
  //         setSessionId(sessionIdFromResponse);

  //         if (sessionIdFromResponse && memberIdFromResponse) {
  //           const notificationStatus = await checkNotification(
  //             sessionIdFromResponse,
  //             memberIdFromResponse
  //           );
  //           setCanCreateRoom(notificationStatus);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('데이터를 가져오는 중 오류 발생:', error);
  //     }
  //   };

  //   fetchMemberData();
  // }, [memberEmail]);

  useEffect(() => {
    if (profileImageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(profileImageFile);
    } else {
      setProfileImagePreview(null);
    }
  }, [profileImageFile]);

  const onClickEditProfile = () => {
    setEditMode(!editMode);
  };

  // const onClickEditMento = () => {
  //   setEditMentoMode(!editMentoMode);
  // };

  const onCancelEditProfile = () => {
    if (profileData) {
      setNewEmail(profileData.email || '');
      setNewName(profileData.name || '');
      setNewTemperature(profileData.temperature || 0);
      setProfileImageFile(null);
      setProfileImagePreview(null);
    }
    setEditMode(false);
  };

  const handleCheckEmailDuplicate = async () => {
    try {
      const response = await apiClient.get('/members/checkEmail', {
        params: { email: newEmail },
      });
      if (response.data == true) {
        MySwal.fire({
          html: `<b>이미 사용 중인 이메일입니다.</b>`,
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: '확인',
        });
      } else {
        setIsEmailVerified(true);
        setNewEmail(newEmail);
        MySwal.fire({
          html: `<b>사용 가능한 이메일입니다.</b>`,
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: '확인',
        });
      }
    } catch (error) {
      console.error('이메일 중복 체크 중 오류 발생:', error);
    }
  };

  const onClickSaveProfile = async () => {
    if (!isEmailVerified) {
      MySwal.fire({
        html: `<b>이메일 중복 확인을 해주세요.</b>`,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: '확인',
      });
      return;
    }

    if (!introduction && profileData !== null && profileData.role === 'MENTOR') {
      MySwal.fire({
        html: `<b>자기소개를 입력해주세요.</b>`,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: '확인',
      });
      return;
    }

    if (introduction.length > 1000) {
      Swal.fire({
        icon: 'error',
        text: '자기소개는 최대 1000자까지 입력할 수 있습니다.',
      });
      return;
    }

    setEditMode(!editMode);
    try {
      const updateMemberRequest: Partial<UserProfile> & { selfProduce?: string | null } = {
        email: newEmail,
      };

      if (profileData !== null && profileData.role === 'MENTOR' && introduction) {
        updateMemberRequest.selfProduce = introduction;
      } else {
        updateMemberRequest.selfProduce = null;
      }

      const formData = new FormData();
      formData.append(
        'updateMemberRequest',
        new Blob([JSON.stringify(updateMemberRequest)], { type: 'application/json' })
      );

      if (profileImageFile) {
        formData.append('profileImg', profileImageFile);
      } else {
        formData.append(
          'profileImg',
          new Blob([], { type: 'application/octet-stream' }),
          'empty-profile-img.png'
        );
      }

      const response = await apiClient.put('/mypage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      MySwal.fire({
        html: `<b>회원 정보가 수정되었습니다.</b>`,
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: '확인',
      });
      setProfileData(response.data);

      const { setUser } = useUserStore.getState();
      setUser({
        email: newEmail,
        name: newName,
        profileImg: profileImagePreview
          ? profileImagePreview
          : profileData
          ? profileData.profileImg
          : null,
        // role: profileData.role,
        role: profileData ? profileData.role : null,
        temperature: newTemperature,
      });
    } catch (error) {
      console.error('회원 정보 수정 중 오류 발생:', error);
    }
  };

  const onResetMentorCertification = async () => {
    try {
      const response = await apiClient.get('/mypage/reset');
      if (response.status === 200) {
        MySwal.fire({
          html: `<b>멘토 인증이 초기화되었습니다.</b>`,
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: '확인',
        });

        const { setUser } = useUserStore.getState();
        setUser({
          ...response.data,
          role: 'MENTEE',
        });

        window.location.reload();
      } else {
        console.warn('서버 응답 상태:', response.status);
      }
    } catch (error) {
      console.error('멘토 인증 초기화 중 오류 발생:', error);
      MySwal.fire({
        html: `<b>멘토 인증 초기화 중 오류가 발생했습니다.</b>`,
        icon: 'error',
        showCancelButton: false,
        confirmButtonText: '확인',
      });
    }
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      // Accept both PNG and JPG files
      if (!['image/png', 'image/jpeg'].includes(selectedFile.type)) {
        MySwal.fire({
          text: `PNG 또는 JPG 파일만 업로드 가능합니다.`,
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: '확인',
        });
        return;
      }

      if (selectedFile.size > FILE_SIZE_MAX_LIMIT) {
        MySwal.fire({
          text: `이미지 파일의 최대 크기는 1MB입니다.`,
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: '확인',
        });
        return;
      }

      setProfileImageFile(selectedFile);
    }
  };

  // const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setNewEmail(event.target.value);
  //   setIsEmailVerified(false);
  // };

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(`${event.target.value}@${emailDomain}`);
    // setEmailId(event.target.value);
    setIsEmailVerified(false);
  };

  const onchangeEmailDomain = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmailDomain(e.target.value);
    setNewEmail(`${newEmail.split('@')[0]}@${e.target.value}`);
    setEditMode(true);
    setIsEmailVerified(false);
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onClickMentoRegisterButton = async () => {
    if (experience.length === 0) {
      MySwal.fire({
        html: `<b>적어도 하나의 경력을 추가해야 멘토 인증이 가능합니다.</b>`,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: '확인',
      });
      return;
    }

    try {
      const updateMemberRequest = {
        selfProduce: introduction,
        addCareerRequests: experience.map((exp) => ({
          companyId: exp.companyId,
          department: exp.department,
          startedDate: exp.startDate + 'T00:00:00',
          endedDate: exp.endDate ? exp.endDate + 'T00:00:00' : null,
        })),
      };
      console.log(updateMemberRequest);
      const formData = new FormData();
      formData.append(
        'createMentorInfoAndCareerRequest',
        new Blob([JSON.stringify(updateMemberRequest)], { type: 'application/json' })
      );

      if (fileText) {
        formData.append('file', fileText);
      }

      const response = await apiClient.post('/mypage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const { setUser } = useUserStore.getState();
        setUser({
          ...response.data,
          role: 'MENTOR',
        });

        window.location.href = 'http://localhost:5173/my-page';
      } else {
        console.warn('서버 응답 상태:', response.status);
      }
    } catch (error) {
      console.error('멘토 정보 수정 중 오류 발생:', error);
    }
  };

  const handleCompanySelect = (companyName: string) => {
    const companyId = String(getCompanyId(companyName));
    // setSelectedCompany(companyName);
    setNewExperience((prev) => ({
      ...prev,
      companyName: companyName,
      companyId: companyId,
    }));
  };

  const handleAddExperience = () => {
    const { companyName, companyId, startDate, endDate, department, isCurrentlyWorking } =
      newExperience;
    const newExp = {
      companyName,
      companyId,
      startDate,
      endDate: isCurrentlyWorking ? '' : endDate,
      department,
      isCurrentlyWorking,
    };
    setExperience([...experience, newExp]);
    setNewExperience({
      companyName: '',
      companyId: '',
      startDate: '',
      endDate: '',
      department: '',
      isCurrentlyWorking: false,
    });
  };

  const isFormValid = () => {
    const { startDate, endDate, isCurrentlyWorking } = newExperience;

    const areFieldsFilled = Object.entries(newExperience).every(([key, val]) => {
      if (key === 'endDate' && isCurrentlyWorking) return true;
      return typeof val === 'string' ? val.trim() !== '' : true;
    });

    const isDateValid = isCurrentlyWorking || new Date(startDate) <= new Date(endDate || startDate);

    return areFieldsFilled && isDateValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const inputValue: string | boolean = type === 'checkbox' ? checked : value;

    setNewExperience((prev) => {
      const updatedExperience: Experience = {
        ...prev,
        [name]: inputValue,
      };

      if (name === 'startDate') {
        const startDate = new Date(value);
        const today = new Date();
        if (startDate > today) {
          MySwal.fire({
            html: `<b>입사 날짜는 오늘 날짜 이전이어야 합니다.</b>`,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: '확인',
          });
          updatedExperience.startDate = prev.startDate; // Revert to previous valid date
        }
      }

      if (name === 'endDate') {
        const endDate = new Date(value);
        const today = new Date();
        if (endDate > today) {
          MySwal.fire({
            html: `<b>퇴사 날짜는 오늘 날짜 이전이어야 합니다.</b>`,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: '확인',
          });
          updatedExperience.endDate = prev.endDate; // Revert to previous valid date
        }
      }

      if ((name === 'startDate' || name === 'endDate') && !updatedExperience.isCurrentlyWorking) {
        const { startDate, endDate } = updatedExperience;

        if (new Date(startDate) > new Date(endDate)) {
          MySwal.fire({
            html: `<b>입사 날짜는 퇴사 날짜보다 이전이어야 합니다.</b>`,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: '확인',
          });
        }
      }

      return updatedExperience;
    });
  };

  // const handleCertificationToggle = () => {
  //   setMentoCertification(!mentoCertification);
  // };

  const handleIntroductionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = event.target.value;
    const lines = inputValue.split('\n');
    let consecutiveLineBreaks = 0;
    let hasError = false;

    for (const line of lines) {
      if (line === '') {
        consecutiveLineBreaks++;
        if (consecutiveLineBreaks >= 5) {
          // 연속된 줄바꿈이 5개 이상인 경우
          hasError = true;
          break;
        }
      } else {
        consecutiveLineBreaks = 0;
      }
    }

    if (!hasError) {
      setIntroduction(inputValue);
    } else {
      alert('연속된 줄바꿈은 최대 4개까지만 허용됩니다.');
    }
  };

  if (loading || !profileData) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div>
        <table className="w-full border-collapse mt-5 ms-3 mr-5">
          <tbody>
            <tr>
              <td className="w-32 p-4 font-semibold text-gray-700">이미지</td>
              <td className="w-40 p-4 flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        className="w-20 h-20 object-cover rounded-full cursor-pointer"
                        alt="Profile"
                        onClick={handleFileInputClick}
                      />
                    ) : profileData.profileImg ? (
                      <img
                        src={profileData.profileImg}
                        className="w-20 h-20 object-cover rounded-full cursor-pointer"
                        alt="Profile"
                        onClick={handleFileInputClick}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                        onClick={handleFileInputClick}
                      >
                        No Image
                      </div>
                    )}
                    {editMode && (
                      <>
                        <input
                          type="file"
                          onChange={handleProfileImageChange}
                          accept="image/png, image/jpeg"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                        />
                        <MdEdit
                          className="absolute bottom-0 right-0 text-white bg-black rounded-full p-1 cursor-pointer"
                          size="1.5em"
                          onClick={handleFileInputClick}
                        />
                      </>
                    )}
                  </div>
                </div>
              </td>
              <td className="w-52 p-4"></td>
            </tr>
            <tr>
              <td className="w-32 p-4 font-semibold text-gray-700">이름</td>
              <td className="w-48 p-4 text-gray-800">
                {profileData.name}
                {profileData.role === 'MENTEE' && newTemperature !== null && (
                  <span className="ml-2 text-sm text-gray-600"> | 🌡️ {newTemperature}°C</span>
                )}
              </td>
            </tr>

            <tr>
              <td className="w-32 p-4 font-semibold text-gray-700">이메일</td>
              {/* <td className="w-32 p-4 text-gray-800"> */}
              <td className="w-48 p-4 text-gray-800">
                {editMode ? (
                  <>
                    {/* <input
                    type="email"
                    value={newEmail}
                    onChange={handleEmailChange}
                    className="w-full px-3 py-1 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                  /> */}
                    <input
                      onChange={handleEmailChange}
                      value={newEmail.split('@')[0]}
                      className="w-32 px-3 py-1 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                    />
                    <span className="m-1 text-lg">@</span>
                    <select
                      className="w-36 px-3 py-1 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                      value={emailDomain}
                      onChange={onchangeEmailDomain}
                    >
                      <option value={'naver.com'}>naver.com</option>
                      <option value={'google.com'}>google.com</option>
                      <option value={'kakao.com'}>kakao.com</option>
                      <option value={'icloud.com'}>icloud.com</option>
                    </select>
                  </>
                ) : (
                  newEmail || profileData.email || '이메일을 입력해주세요.'
                )}
              </td>
              <td className="w-32">
                {editMode && !isEmailVerified && newEmail.charAt(0) !== '@' && (
                  <button
                    onClick={handleCheckEmailDuplicate}
                    className="bg-[#4CCDC6] text-white rounded py-1 px-3"
                  >
                    중복체크
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <td className="w-32 p-4 font-semibold text-gray-700">멘토/멘티</td>
              <td className="w-32 p-4 text-gray-800">
                <span>현재 </span>
                <span className="mx-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {profileData.role}
                </span>
                <span>로 설정되어 있습니다.</span>
              </td>
              {profileData.role === 'MENTEE' && !editMode && (
                <td className="w-32 p-4">
                  <button
                    className="hover:text-[#3AB8B2] rounded-2xl px-4 py-2 cursor-pointer"
                    onClick={() => setMentoCertification(!mentoCertification)}
                  >
                    {mentoCertification ? '닫기' : '👉 멘토 인증 하러가기'}
                  </button>
                </td>
              )}
            </tr>
            {mentoCertification && profileData.role === 'MENTEE' && (
              <tr>
                <td colSpan={2}>
                  <table className="w-full border-collapse mt-5">
                    <tbody>
                      <tr>
                        <td className="w-32 p-4 font-semibold text-gray-700">회사 이름</td>
                        <td className="w-32 p-4">
                          <CompanySearch onCompanySelect={handleCompanySelect} />
                        </td>
                      </tr>
                      <tr>
                        <td className="w-32 p-4 font-semibold text-gray-700">입사 날짜</td>
                        <td className="w-32 p-4">
                          <input
                            type="date"
                            name="startDate"
                            value={newExperience.startDate}
                            onChange={handleInputChange}
                            className="w-full px-3 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="w-32 p-4 font-semibold text-gray-700"></td>
                        <td className="w-32 p-4">
                          <label>
                            <input
                              type="checkbox"
                              name="isCurrentlyWorking"
                              checked={newExperience.isCurrentlyWorking}
                              onChange={handleInputChange}
                              className="w-4 h-4 mx-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
                            />
                            <label>현재 재직 중</label>
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td className="w-32 p-4 font-semibold text-gray-700">퇴사 날짜</td>
                        <td className="w-32 p-4">
                          <input
                            type="date"
                            name="endDate"
                            value={newExperience.endDate}
                            onChange={handleInputChange}
                            disabled={newExperience.isCurrentlyWorking}
                            className="w-full px-3 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                            required
                          />
                        </td>
                      </tr>

                      <tr>
                        <td className="w-32 p-4 font-semibold text-gray-700">직무</td>
                        <td className="w-32 p-4">
                          <input
                            type="text"
                            name="department"
                            value={newExperience.department}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="p-4">
                          <button
                            onClick={handleAddExperience}
                            className={`bg-[#4CCDC6] text-white rounded px-4 py-2 ${
                              isFormValid() ? '' : 'opacity-50 cursor-not-allowed'
                            }`}
                            disabled={!isFormValid()}
                          >
                            경력 추가
                          </button>
                        </td>
                      </tr>

                      {experience.length > 0 && (
                        <tr>
                          <td colSpan={2}>
                            <table className="w-full border-collapse mt-5 mb-5">
                              <thead>
                                <tr>
                                  <th className="w-32 p-4 font-semibold text-gray-700">
                                    회사 이름
                                  </th>
                                  <th className="w-32 p-4 font-semibold text-gray-700">
                                    입사 날짜
                                  </th>
                                  <th className="w-32 p-4 font-semibold text-gray-700">
                                    퇴사 날짜
                                  </th>
                                  <th className="w-32 p-4 font-semibold text-gray-700">직무</th>
                                </tr>
                              </thead>
                              <tbody>
                                {experience.map((exp, index) => (
                                  <tr key={index}>
                                    <td
                                      className="w-32 p-4 text-gray-800"
                                      style={{ paddingLeft: '30px' }}
                                    >
                                      {exp.companyName}
                                    </td>
                                    <td className="w-32 p-4 text-gray-800">{exp.startDate}</td>
                                    <td className="w-32 p-4  text-gray-800">
                                      {exp.endDate ? exp.endDate : '재직중'}
                                    </td>
                                    <td className="w-32 p-4 text-gray-800">{exp.department}</td>

                                    <button
                                      onClick={() => handleDeleteExperience(index)}
                                      className="bg-[#c8480d] text-white rounded px-4 py-2"
                                    >
                                      삭제
                                    </button>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}

                      <tr>
                        <td className="w-32 pt-10 p-4 font-semibold text-gray-700">경력증명서</td>
                        <td style={{ paddingLeft: '20px' }}>
                          <div className="relative flex items-center">
                            <label htmlFor="file-upload">
                              <div className="border-[1px] border-[#D5D7D9] border-solid rounded h-10 min-w-[435px] w-3/4 px-3 py-2 truncate">
                                {!fileText ? (
                                  <div className="absolute top-2 left-4 text-[#B1B3B5]">
                                    경력증명서 제출 <span className="text-red-700">*</span>
                                  </div>
                                ) : (
                                  fileText.name
                                )}
                              </div>
                            </label>
                            <input
                              id="file-upload"
                              type="file"
                              name="file"
                              className="hidden"
                              accept=".pdf, .docx"
                              onChange={handleFileSelect}
                            />

                            {fileText && (
                              <button
                                type="button"
                                className="ml-4 text-red-600"
                                onClick={handleRemoveFile}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="w-32 p-4 font-semibold text-gray-700">자기소개</td>
                        <td className="w-32 p-4">
                          <textarea
                            name="introduction"
                            value={introduction || ''}
                            onChange={handleIntroductionChange}
                            className="w-full px-3 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                            rows={4}
                            maxLength={1000}
                          />
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={2} className="text-center">
                          <div className="mt-4">
                            <button
                              onClick={onClickMentoRegisterButton}
                              className="bg-[#3884e0] text-white rounded px-4 py-2"
                            >
                              멘토 인증
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            )}

            {isMentorProfile(profileData) && (
              <>
                <tr>
                  <td></td>
                  <td className="px-4">
                    <p className="text-green-600 font-semibold">✅ 인증이 완료되었습니다.</p>
                  </td>
                </tr>
                <tr>
                  <td className="w-32 p-4 font-semibold text-gray-700">자기소개</td>
                  <td className="w-32 p-4 text-gray-800">
                    {editMode ? (
                      <>
                        <textarea
                          name="introduction"
                          value={introduction || ''}
                          onChange={handleIntroductionChange}
                          className="w-full px-3 rounded border border-gray focus:border-[#4CCDC6] focus:outline-none focus:ring-2 focus:ring-[#4CCDC6]"
                          rows={6}
                          maxLength={1000}
                        />
                      </>
                    ) : (
                      <div
                        className="text-md text-gray-700"
                        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                      >
                        <div
                          className="mt-2"
                          dangerouslySetInnerHTML={{ __html: profileData.mentorInfo.selfProduce }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="w-32 p-4 font-semibold text-gray-700">경력사항</td>
                  <td>
                    {profileData.mentorInfo?.careers.map((exp, index) => (
                      <tr key={index}>
                        <td className="w-32 p-4 text-gray-800">{exp.companyName}</td>
                        <td className="w-20 p-4 text-gray-800">{exp.startedDate}</td>
                        <td className="text-gray-800">~</td>
                        <td className="w-32 p-4 text-gray-800">{exp.endedDate}</td>
                        <td className="w-32 p-4 text-gray-800">{exp.department}</td>
                      </tr>
                    ))}
                  </td>
                </tr>
              </>
            )}

            <tr>
              <td></td>
              <td></td>
              <td>
                <div className="flex justify-end">
                  <div className="flex items-center space-x-2">
                    {editMode ? (
                      <>
                        <button
                          className="bg-[#4CCDC6] text-white hover:bg-[#3AB8B2] rounded-2xl px-4 py-2 cursor-pointer"
                          onClick={onClickSaveProfile}
                          // disabled={!isEmailVerified}
                        >
                          저장
                        </button>
                        <div
                          className="bg-gray-500 text-black hover:bg-gray-600 rounded-2xl px-4 py-2 cursor-pointer"
                          onClick={onCancelEditProfile}
                        >
                          취소
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="bg-[#4CCDC6] text-white hover:bg-[#3AB8B2] rounded-2xl px-4 py-2 cursor-pointer"
                          onClick={onClickEditProfile}
                        >
                          변경
                        </div>
                        {isMentorProfile(profileData) && (
                          <div
                            className="bg-red-500 text-white hover:bg-red-600 rounded-2xl px-4 py-2 cursor-pointer"
                            onClick={onResetMentorCertification}
                          >
                            멘토 인증 초기화
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* <tr>
            <td className="w-32 p-4">
              {canCreateRoom && (
                <Button
                  // className="bg-red-500 text-white hover:bg-red-600"
                  text="방 참여하기"
                  onClick={() => handleCreateSession(sessionId)}
                />
              )}
            </td>
          </tr> */}
          </tbody>
        </table>
      </div>
    </Suspense>
  );
};

export default ProfileSetting;
