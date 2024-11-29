import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Container,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  PaperProps
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';
interface ItemProps extends PaperProps {
  answerVariant: 'default' | 'readOnly' | 'correct' | 'incorrect';
}

const Item = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'answerVariant'
})<ItemProps>(({ theme, answerVariant }) => ({
  height: '100%',
  backgroundColor:
    answerVariant === 'correct'
      ? '#d4edda'
      : answerVariant === 'incorrect'
        ? '#f8d7da'
        : '#1d3557',
  opacity: answerVariant === 'readOnly' ? '0.8' : '1',
  padding: theme.spacing(1),
  textAlign: 'center',
  color:
    answerVariant === 'correct' || answerVariant === 'incorrect'
      ? '#000'
      : '#fff',
  cursor: answerVariant === 'readOnly' ? 'auto' : 'pointer',
  transition: 'background-color 0.1s ease-in'
}));

interface GridItemProps extends PaperProps {
  isReadOnly: boolean;
  index: number;
  currentQuestion: Question;
  currentQuestionIndex: number;
  answers: any;
  onClick: () => void;
}

const GridItem: React.FC<GridItemProps> = ({
  isReadOnly,
  currentQuestion,
  index,
  answers,
  currentQuestionIndex,
  children,
  onClick,
  ...props
}) => {
  let answerVariant: ItemProps['answerVariant'] = 'default';
  if (isReadOnly) {
    if (index === currentQuestion.correct_option_index) {
      answerVariant = 'correct';
    } else if (index === answers[currentQuestionIndex]) {
      answerVariant = 'incorrect';
    } else {
      answerVariant = 'readOnly';
    }
  }

  return (
    <Item
      tabIndex={0}
      answerVariant={answerVariant}
      onClick={!isReadOnly ? onClick : undefined}
      {...props}
    >
      {children}
    </Item>
  );
};

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
  const [answers, setAnswers] = useState<(number | null)[]>([null]);
  const initialTimer = 30;
  const [timer, setTimer] = useState(initialTimer); // Total time for the entire quiz in seconds

  useEffect(() => {
    if (quizFile) {
      fetch(quizFile)
        .then((response) => response.arrayBuffer())
        .then((data) => {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, {
            header: 1
          });
          let loadedQuestions = jsonData.slice(1).map((row) => {
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

  const isReadOnly = answers[currentQuestionIndex] !== null;

  useEffect(() => {
    if (!isReadOnly) {
      setTimer(initialTimer);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (!isReadOnly) {
      if (timer > 0) {
        const timeout = setTimeout(() => setTimer(timer - 1), 1000);
        return () => clearTimeout(timeout);
      } else {
        putAnswer(-1);
        handleNext();
      }
    }
  }, [timer]);

  const putAnswer = (answerIndex: number) => {
    if (!isReadOnly) {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = answerIndex;
      setAnswers(updatedAnswers);
    }
  };

  const handleNext = () => {
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

  const correctlyAnsweredQuestion =
    currentQuestionIndex === currentQuestion.correct_option_index;

  return (
    <Container maxWidth="sm">
      <Typography
        variant="subtitle1"
        className={`timer-text ${timer <= 5 ? 'danger-time' : ''} `}
      >
        Vaqt qoldi: {timer}s
      </Typography>
      <div className="question-block">
        <div>
          <span className="question-number">
            {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>
        <Typography variant="body1">{currentQuestion.question_text}</Typography>
      </div>
      <Grid container spacing={2}>
        {currentQuestion.options.map((option, index) => {
          return (
            <Grid key={index} size={6}>
              <GridItem
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                onClick={() => putAnswer(index)}
                isReadOnly={isReadOnly}
                index={index}
              >
                {option}
              </GridItem>
            </Grid>
          );
        })}
      </Grid>
      <Grid container spacing={1}>
        <Grid size={8}>
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
              disabled={!isReadOnly}
            >
              {currentQuestionIndex === questions.length - 1
                ? 'Tugatish✓'
                : 'Keyingisi>'}
            </Button>
          </div>
        </Grid>
        <Grid size={4}>
          <div className="actions-container">
            {currentQuestionIndex !== questions.length - 1 && (
              <Button
                variant="contained"
                color="error"
                className="button-finish"
                onClick={finishTest}
              >
                Tugatish✓
              </Button>
            )}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Page2;
