// Authorship: Yahan

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Progress } from 'antd';
import { BACKEND_URL } from './utils/constants';

// HAVEN"T USED THIS YET
const EmotionScores = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(`${BACKEND_URL}/comments`);
      setComments(result.data);
    };

    fetchData();
  }, []);

  return (
    <>
      {comments.map((comment) => (
        <Card title={`Comment by ${comment._id}`} key={comment._id}>
          <Progress percent={comment.probability.joy * 100} status="active" />
          <Progress percent={comment.probability.optimism * 100} status="active" />
          <Progress percent={comment.probability.anger * 100} status="active" />
          <Progress percent={comment.probability.sadness * 100} status="active" />
        </Card>
      ))}
    </>
  );
};

export default EmotionScores;
