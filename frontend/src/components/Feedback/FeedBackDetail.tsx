import Intro from '@components/common/Intro';
import pair from '../../assets/img/PairFeedBack.png';
import mentor from '../../assets/img/MentorFeedBack.png';
import { useState } from 'react';
import useFeedBackStore from '@store/feedback';
import FeedBackDetailForm from './FeedBackDetailForm';
import { useNavigate } from 'react-router-dom';
import RegisterBtn from '../common/RegisterBtn';
import Robo from '@assets/image/robot.jpg';

const FeedBackDetail = () => {
  const imgArr = [mentor, pair];
  const [click, setClick] = useState(-1);
  const router = useNavigate();
  const { detail, mentorInfo } = useFeedBackStore((state) => state.states);
  // 이것도 같이 동기화 시켜버리기
  const data = [detail.mentorFeedback, detail.menteeFeedbacks];
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-11/12">
        <div className="flex items-center justify-center">
          <Intro
            title={`#${mentorInfo.respondentId} ${mentorInfo.mentorInfo.companyName} ${mentorInfo.mentorInfo.name}와의 면접 미팅 피드백`}
            sub={`${mentorInfo.date} ${mentorInfo.mentorInfo.name}의 면접 미팅에서의 피드백을 확인하세요.`}
          />
          <RegisterBtn
            text="리뷰쓰기"
            width="w-16"
            height="h-10"
            fontSize="text-md"
            onClick={() =>
              router('/review', {
                state: {
                  respondentId: detail.respondentId,
                },
              })
            }
            disabled={detail.isEvaluated}
          />
        </div>
        <div className="w-full min-h-[615px] bg-full bg-laptop bg-no-repeat flex gap-16 justify-center py-16">
          <div
            className="h-[350px] w-[334px] border-[1px] border-solid border-[rgba(28,31,34,0.2)]
           overflow-scroll rounded-2xl px-4 py-6 flex flex-col gap-y-2.5"
          >
            {click !== -1 &&
              data[click].map((e, i) => {
                return (
                  <div className="flex gap-1.5 font-bold text-sm w-full" key={i}>
                    {FeedBackDetailForm(e, click, i)}
                  </div>
                );
              })}
            {click === -1 && (
              <div className="flex flex-col justify-center items-center h-screen gap-4">
                <img src={Robo} width={64} height={64} />
                <div>이미지를 눌러 피드백을 확인해보세요</div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-16">
            {imgArr.map((e, i) => {
              return (
                <div
                  className="w-16 h-16 relative"
                  key={i}
                  onClick={() => {
                    if (i === click) {
                      setClick(-1);
                    } else {
                      setClick(i);
                    }
                  }}
                >
                  {i === click && (
                    <div className="absolute top-0 left-0 w-full h-full rounded-full bg-main-color blur-lg shadow-feedback"></div>
                  )}
                  <div className=" w-full h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <img src={e} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedBackDetail;
