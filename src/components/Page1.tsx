import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Select, MenuItem, Container } from '@mui/material';

function Page1() {
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizThemes, setQuizThemes] = useState<
    { name: string; file: string }[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const themes = import.meta.glob('../themes/*.xlsx', {
      as: 'url',
      eager: true
    });
    const themeList = Object.entries(themes).map(([path, url]) => {
      const fileName = path.split('/').pop() || '';
      const name = fileName.replace('.xlsx', '');
      return { name, file: url as string };
    });
    setQuizThemes(themeList);
  }, []);

  const handleStart = () => {
    if (selectedQuiz) {
      navigate('/quiz', { state: { quizFile: selectedQuiz } });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" className="title-type">
        Assalomu Aleykum!
      </Typography>
      <Typography variant="body1">Fanni tanlang</Typography>

      <Select
        fullWidth
        value={selectedQuiz}
        onChange={(e) => {
          setSelectedQuiz(e.target.value as string);
        }}
      >
        {quizThemes.map((quiz) => (
          <MenuItem key={quiz.file} value={quiz.file}>
            {quiz.name}
          </MenuItem>
        ))}
      </Select>
      <div className="start-button">
        <Button
          variant="contained"
          color="primary"
          onClick={handleStart}
          disabled={!selectedQuiz}
        >
          BISMILLAH
        </Button>
      </div>
    </Container>
  );
}

export default Page1;
