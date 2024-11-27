import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Container,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import * as XLSX from 'xlsx';

interface Question {
  question_text: string;
  options: string[];
  correct_option_index: number;
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function Page2() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizFile } = location.state || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timer, setTimer] = useState(355); // Total time for the entire quiz in seconds

  useEffect(() => {
    if (quizFile) {
      fetch(quizFile)
        .then((response) => response.arrayBuffer())
        .then((data) => {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          let loadedQuestions = jsonData.slice(1).map((row: any[]) => {
            const options = [row[1], row[2], row[3], row[4]];
            const correctOptionIndex = parseInt(row[5]) - 1; // original index

            // Shuffle options
            const optionIndices = [0, 1, 2, 3];
            shuffleArray(optionIndices);
            const shuffledOptions = optionIndices.map((i) => options[i]);
            const newCorrectOptionIndex = optionIndices.findIndex(
              (i) => i === correctOptionIndex
            );

            return {
              question_text: row[0],
              options: shuffledOptions,
              correct_option_index: newCorrectOptionIndex
            };
          });

          // Shuffle the questions
          shuffleArray(loadedQuestions);

          setQuestions(loadedQuestions);
          setAnswers(Array(loadedQuestions.length).fill(null));
        });
    }
  }, [quizFile]);

  const finishTest = () => {
    navigate('/result', { state: { questions, answers } });
  };

  useEffect(() => {
    if (timer > 0) {
      const timeout = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timeout);
    } else {
      finishTest();
    }
  }, [timer]);

  const isReadOnly =
    answers[currentQuestionIndex] !== null &&
    currentQuestionIndex < questions.length;

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReadOnly) {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = parseInt(event.target.value);
      setAnswers(updatedAnswers);
    }
  };

  const handleNext = () => {
    if (isReadOnly && currentQuestionIndex != questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishTest();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (questions.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Container maxWidth="sm">
      <Typography variant="subtitle1">Vaqt qoldi: {timer}s</Typography>
      <div className="question-block">
        <div>
          <span className="question-number">
            {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>
        <Typography variant="body1">{currentQuestion.question_text}</Typography>
      </div>

      <RadioGroup
        value={
          selectedOption !== null
            ? selectedOption?.toString()
            : isReadOnly
              ? answers[currentQuestionIndex]
              : ''
        }
        onChange={handleOptionChange}
      >
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === index;
          let labelClass = '';

          if (isReadOnly) {
            if (index == currentQuestion.correct_option_index) {
              labelClass = 'correct-answer';
            } else if (index === answers[currentQuestionIndex]) {
              labelClass = 'incorrect-answer';
            }
          }

          return (
            <FormControlLabel
              key={index}
              value={index.toString()}
              control={<Radio />}
              label={<span className={labelClass}>{option}</span>}
              disabled={isReadOnly}
            />
          );
        })}
      </RadioGroup>
      <div className="actions-container">
        <Button
          variant="outlined"
          className="button-back"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          &lt;Orqaga
        </Button>
        <Button
          variant="contained"
          color="primary"
          className="button-next"
          onClick={handleNext}
          disabled={selectedOption === null && !isReadOnly}
        >
          {currentQuestionIndex === questions.length - 1
            ? 'Tugatish✓'
            : 'Keyingisi>'}
        </Button>
        {currentQuestionIndex !== questions.length - 1 && (
          <Button
            variant="contained"
            color="error"
            className="button-next"
            onClick={finishTest}
          >
            Tugatish✓
          </Button>
        )}
      </div>
    </Container>
  );
}

export default Page2;
