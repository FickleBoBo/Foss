import Logo from '@assets/image/logo.png';
import mento1 from '@assets/image/mento1.png';
import bell from '@assets/image/bell.png';
import React, { useEffect, useState } from 'react';
import UnreadNotificationCount from '@components/Notification/UnreadNotification';
import setupEventSource from '@components/Notification/SseNotification';
import { useNavigate } from 'react-router-dom';

const Nav: React.FC = () => {
  interface Notification {
    content: string;
    targetUrl: string;
    isRead: boolean;
    createdDate: string;
  }

  const [unreadCount, setUnreadCount] = useState<number>(6);
  const [sseNotifications, setSseNotifications] = useState<Notification[]>([]);

  // useEffect(() => {
  //   const loadUnreadCount = async () => {
  //     try {
  //       const count = await UnreadNotificationCount();
  //       setUnreadCount(count);
  //     } catch (error) {
  //       console.error('Failed to load unread notification count:', error);
  //     }
  //   };

  //   loadUnreadCount();
  // }, []);

  useEffect(() => {
    const cleanupEventSource = setupEventSource((newNotification) => {
      setSseNotifications((prevNotifications) => [...prevNotifications, newNotification]);
    });

    return cleanupEventSource;
  }, []);

  const nav = useNavigate();

  return (
    <div className="w-full  overflow-hidden">
      <div className="absolute w-full top-0 left-0 bg-white">
        <div className="max-w-8xl h-[60px] flex items-center justify-between px-4 ml-60 mb-8 whitespace-nowrap">
          <img
            className="h-10 cursor-pointer"
            alt="Logo"
            src={Logo}
            onClick={() => {
              nav('/');
            }}
          />
          <div className="flex space-x-8 mr-40">
            <div className="rounded-lg px-4 py-3">
              {/* <span className="font-notoKR_DemiLight text-nav-gray-color text-sm">회사 소개</span> */}
              <button
                className="font-notoKR_DemiLight text-nav-gray-color text-sm"
                onClick={() => {
                  nav('/about-us');
                }}
              >
                회사 소개
              </button>
            </div>
            <div className="rounded-lg px-4 py-3">
              {/* <span className="font-notoKR_DemiLight text-nav-gray-color text-sm">고객센터</span> */}
              <button
                className="font-notoKR_DemiLight text-nav-gray-color text-sm"
                onClick={() => {
                  nav('/support');
                }}
              >
                고객센터
              </button>
            </div>
            <div className="rounded-lg px-4 py-3">
              {/* <span className="font-notoKR_DemiLight text-nav-gray-color text-sm">
                자주 묻는 질문
              </span> */}
              <button
                className="font-notoKR_DemiLight text-nav-gray-color text-sm"
                onClick={() => {
                  nav('/faq');
                }}
              >
                자주 묻는 질문
              </button>
            </div>
            <div className="rounded-lg px-4 py-3">
              {/* <span className="font-notoKR_DemiLight text-nav-gray-color text-sm">면접일정</span> */}
              <button
                className="font-notoKR_DemiLight text-nav-gray-color text-sm"
                onClick={() => {
                  nav('/interview-schedule');
                }}
              >
                면접일정
              </button>
            </div>
            <div className="rounded-lg px-4 py-3">
              {/* <span className="font-notoKR_DemiLight text-nav-gray-color text-sm">커뮤니티</span> */}
              <button
                className="font-notoKR_DemiLight text-nav-gray-color text-sm"
                onClick={() => {
                  nav('/community');
                }}
              >
                커뮤니티
              </button>
            </div>
            <div className="relative rounded-lg pl-20 py-4">
              <img className=" w-[20px] h-[20px] ]" src={bell} />
              {unreadCount > 0 && (
                <span className="absolute top-[6px] right-[-1px] bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <div>
                {sseNotifications.map((notification) => (
                  <div key={notification.createdDate}>
                    <p>{notification.content}</p>
                    <small>{notification.createdDate}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg pl-2 py-2">
              <div className="w-[35px] h-[35px]">
                <img
                  className="-[35px] h-[35px] rounded-[50px] cursor-pointer"
                  src={mento1}
                  onClick={() => {
                    nav('/my-page');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
