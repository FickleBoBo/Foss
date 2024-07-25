import { Tschedules } from '@/constants/testData';
import { useScheduleStore } from '@/store/schedule';
import UnCheck from '../../assets/svg/UnCheckbox.svg?react';
import Check from '../../assets/svg/Checkbox.svg?react';
import Folder from '../../assets/svg/mypage/document.svg?react';
import { Link } from 'react-router-dom';

const MenteeListCard = ({ props, time }: { props: Tschedules; time: string }) => {
  const { MenteeList } = useScheduleStore((state) => state.states);
  const { setMenteeList } = useScheduleStore((state) => state.actions);
  const onClick = (id: number, isCheck: boolean) => {
    if (props.isConfirmed === true) {
      alert('이미 지원자가 확정되었습니다');
      return;
    }
    if (MenteeList.length >= 2 && !isCheck) {
      alert('3명 이상 체크할 수 없습니다.');
    } else {
      setMenteeList(id);
    }
  };
  return (
    <div key={props.scheduleId}>
      {props.time === time &&
        props.applies.map((e) => (
          <div
            key={e.memberId}
            className="min-w-[300px] flex gap-1.5 mb-2.5 justify-between px-2 items-center"
          >
            <div className="flex gap-2 items-center  text-lg">
              {e.name}
              <Link to={e.fileUrl} target="_blank">
                <Folder />
              </Link>
            </div>
            <div>
              {MenteeList.includes(e.memberId) ? (
                <Check onClick={() => onClick(e.memberId, true)} />
              ) : (
                <UnCheck onClick={() => onClick(e.memberId, false)} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MenteeListCard;