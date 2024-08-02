import apiClient from '@/utils/util';
import Nav from '@/components/Header/NavComponent';
import Button from '@/components/Community/Button';
import Loading from '@/components/common/Loading';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const UpdatePost = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>();
  const [writer, setWriter] = useState();
  const [content, setContent] = useState<string>();
  const [regDate, setRegDate] = useState();
  const nav = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postResponse = await apiClient.get(`/community/${id}`);
        const post = postResponse.data;
        if (post) {
          setTitle(post.title);
          setWriter(post.writer);
          setContent(post.content);
          setRegDate(post.regDate);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const onSavePost = () => {
    const fetchPost = async () => {
      try {
        await apiClient.put(`/community/${id}`, {
          id: id,
          title: title,
          content: content,
          writer: writer,
        });
        nav('/community');
      } catch (error) {
        console.error(error);
      }
    };

    fetchPost();
  };

  const onCancelPost = () => {
    nav(`/community/${id}`);
  };

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const onChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 shadow-lg rounded-lg">
      <div>
        <Nav />
      </div>

      <h1 className="text-2xl font-bold text-teal-800 mb-6">게시글 수정</h1>

      <div className="mb-4">
        <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={onChangeTitle}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="게시글 제목을 입력하세요"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="writer" className="block text-lg font-medium text-gray-700 mb-2">
          글쓴이
        </label>
        <input
          id="writer"
          type="text"
          value={writer}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="writer" className="block text-lg font-medium text-gray-700 mb-2">
          작성일
        </label>
        <input
          id="regDate"
          type="text"
          value={regDate}
          readOnly
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={onChangeContent}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="게시글 내용을 입력하세요"
        />
      </div>

      <div className="flex gap-4 mt-6">
        <Button text="저장" type={'SAVE'} onClick={onSavePost} />
        <Button text="취소" type={'CANCEL'} onClick={onCancelPost} />
      </div>
    </div>
  );
};

export default UpdatePost;
