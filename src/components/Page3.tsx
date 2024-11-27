import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Typography, Container } from '@mui/material';

interface Question {
  question_text: string;
  options: string[];
  correct_option_index: number;
}

function Page3() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions, answers } = location.state || {};

  if (!questions || !answers) {
    return <Typography>Result not available</Typography>;
  }

  const correctCount = questions.reduce(
    (count: number, question: Question, index: number) => {
      if (answers[index] === question.correct_option_index) {
        return count + 1;
      }
      return count;
    },
    0
  );

  const percentage = ((correctCount / questions.length) * 100).toFixed(2);

  const handleRestart = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Tabriklaymiz!</Typography>
      <Typography variant="body1">
        Siz {questions.length} savoldan {correctCount}-ta ga to'gri javob
        berdingiz
      </Typography>
      <Typography variant="h5">Baho: {percentage}%</Typography>
      <Button variant="contained" color="primary" onClick={handleRestart}>
        Qayta boshlash
      </Button>
    </Container>
  );
}

export default Page3;
