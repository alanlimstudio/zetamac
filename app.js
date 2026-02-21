const { useEffect, useRef, useState } = React;
const h = React.createElement;

const DEFAULTS = {
  addition: true,
  subtraction: true,
  multiplication: true,
  division: true,
  ranges: {
    addition: [2, 100, 2, 100],
    subtraction: [2, 100, 2, 100],
    multiplication: [2, 12, 2, 100],
    division: [2, 12, 2, 100],
  },
  duration: 120,
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildQuestion(settings) {
  const ops = [];
  if (settings.addition) ops.push('add');
  if (settings.subtraction) ops.push('sub');
  if (settings.multiplication) ops.push('mul');
  if (settings.division) ops.push('div');

  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 0;
  let b = 0;
  let text = '';
  let answer = 0;

  if (op === 'add') {
    const [minA, maxA, minB, maxB] = settings.ranges.addition;
    a = randomInt(minA, maxA);
    b = randomInt(minB, maxB);
    text = `${a} + ${b} =`;
    answer = a + b;
  } else if (op === 'sub') {
    const [minA, maxA, minB, maxB] = settings.ranges.addition;
    a = randomInt(minA, maxA);
    b = randomInt(minB, maxB);
    if (b > a) [a, b] = [b, a];
    text = `${a} - ${b} =`;
    answer = a - b;
  } else if (op === 'mul') {
    const [minA, maxA, minB, maxB] = settings.ranges.multiplication;
    a = randomInt(minA, maxA);
    b = randomInt(minB, maxB);
    text = `${a} × ${b} =`;
    answer = a * b;
  } else {
    const [minA, maxA, minB, maxB] = settings.ranges.division;
    a = randomInt(minA, maxA);
    b = randomInt(minB, maxB);
    const product = a * b;
    text = `${product} ÷ ${b} =`;
    answer = a;
  }

  return { text, answer };
}

function Setup({ settings, onChange, onStart }) {
  const updateRange = (key, index, value) => {
    const next = { ...settings, ranges: { ...settings.ranges } };
    const current = [...next.ranges[key]];
    current[index] = Number(value);
    next.ranges[key] = current;
    onChange(next);
  };

  const setToggle = (key) => (event) => {
    onChange({ ...settings, [key]: event.target.checked });
  };

  const durationOptions = [30, 60, 120, 300, 600];
  const disabled = !settings.addition && !settings.subtraction && !settings.multiplication && !settings.division;

  return h(
    'div',
    { className: 'setup-wrap' },
    h(
      'section',
      { className: 'setup-panel' },
      h('h1', null, 'Arithmetic Game'),
      h(
        'p',
        null,
        'The Arithmetic Game is a fast-paced speed drill where you are given two minutes to solve as many arithmetic problems as you can.'
      ),
      h(
        'p',
        null,
        'If you have any questions, please contact ',
        h('a', { href: 'mailto:arithmetic@zetamac.com' }, 'arithmetic@zetamac.com'),
        '.'
      ),
      h(
        'div',
        { className: 'options' },
        h(
          'div',
          { className: 'option-row' },
          h('input', { type: 'checkbox', checked: settings.addition, onChange: setToggle('addition') }),
          h(
            'div',
            null,
            h('strong', null, 'Addition'),
            h(
              'span',
              { className: 'range' },
              'Range:',
              h('input', {
                value: settings.ranges.addition[0],
                onChange: (e) => updateRange('addition', 0, e.target.value),
              }),
              'to',
              h('input', {
                value: settings.ranges.addition[1],
                onChange: (e) => updateRange('addition', 1, e.target.value),
              }),
              '+',
              h('input', {
                value: settings.ranges.addition[2],
                onChange: (e) => updateRange('addition', 2, e.target.value),
              }),
              'to',
              h('input', {
                value: settings.ranges.addition[3],
                onChange: (e) => updateRange('addition', 3, e.target.value),
              })
            )
          )
        ),
        h(
          'div',
          { className: 'option-row' },
          h('input', { type: 'checkbox', checked: settings.subtraction, onChange: setToggle('subtraction') }),
          h('div', null, h('strong', null, 'Subtraction'), h('div', { className: 'notice' }, 'Addition problems in reverse.'))
        ),
        h(
          'div',
          { className: 'option-row' },
          h('input', { type: 'checkbox', checked: settings.multiplication, onChange: setToggle('multiplication') }),
          h(
            'div',
            null,
            h('strong', null, 'Multiplication'),
            h(
              'span',
              { className: 'range' },
              'Range:',
              h('input', {
                value: settings.ranges.multiplication[0],
                onChange: (e) => updateRange('multiplication', 0, e.target.value),
              }),
              'to',
              h('input', {
                value: settings.ranges.multiplication[1],
                onChange: (e) => updateRange('multiplication', 1, e.target.value),
              }),
              '×',
              h('input', {
                value: settings.ranges.multiplication[2],
                onChange: (e) => updateRange('multiplication', 2, e.target.value),
              }),
              'to',
              h('input', {
                value: settings.ranges.multiplication[3],
                onChange: (e) => updateRange('multiplication', 3, e.target.value),
              })
            )
          )
        ),
        h(
          'div',
          { className: 'option-row' },
          h('input', { type: 'checkbox', checked: settings.division, onChange: setToggle('division') }),
          h('div', null, h('strong', null, 'Division'), h('div', { className: 'notice' }, 'Multiplication problems in reverse.'))
        ),
        h(
          'div',
          { className: 'duration-row' },
          h('span', null, 'Duration:'),
          h(
            'select',
            { value: settings.duration, onChange: (e) => onChange({ ...settings, duration: Number(e.target.value) }) },
            durationOptions.map((opt) => h('option', { key: opt, value: opt }, `${opt} seconds`))
          )
        )
      ),
      h('div', { className: 'start-row' }, h('button', { onClick: onStart, disabled }, 'Start'))
    )
  );
}

function Game({ settings, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(() => buildQuestion(settings));
  const inputRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [question]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          onFinish(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onFinish]);

  const handleCorrect = () => {
    setScore((s) => {
      const next = s + 1;
      scoreRef.current = next;
      return next;
    });
    setQuestion(buildQuestion(settings));
    inputRef.current.value = '';
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = inputRef.current.value.trim();
    if (value === '') return;
    if (Number(value) === question.answer) {
      handleCorrect();
    } else {
      inputRef.current.value = '';
    }
  };

  const handleInput = (event) => {
    const value = event.target.value.trim();
    if (value === '') return;
    if (Number(value) === question.answer) {
      handleCorrect();
    }
  };

  return h(
    'div',
    { className: 'game-wrap' },
    h('header', { className: 'game-header' }, h('div', null, `Seconds left: ${timeLeft}`), h('div', null, `Score: ${score}`)),
    h(
      'div',
      { className: 'question-bar' },
      h('div', { className: 'question' }, question.text),
      h(
        'form',
        { onSubmit: handleSubmit },
        h('input', { className: 'answer-input', ref: inputRef, inputMode: 'numeric', onInput: handleInput })
      )
    ),
    h('div', { className: 'game-footer' })
  );
}

function Results({ score, onRestart }) {
  return h(
    'div',
    { className: 'results-wrap' },
    h(
      'section',
      { className: 'results-panel' },
      h('h2', null, "Time's up!"),
      h('p', null, `Your score: ${score}`),
      h('div', { className: 'results-actions' }, h('button', { onClick: onRestart }, 'Try again'))
    )
  );
}

function App() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [mode, setMode] = useState('setup');
  const [finalScore, setFinalScore] = useState(0);

  const handleStart = () => setMode('game');
  const handleFinish = (score) => {
    setFinalScore(score);
    setMode('results');
  };
  const handleRestart = () => setMode('setup');

  return h(
    'div',
    { className: 'app' },
    mode === 'setup' && h(Setup, { settings, onChange: setSettings, onStart: handleStart }),
    mode === 'game' && h(Game, { settings, onFinish: handleFinish }),
    mode === 'results' && h(Results, { score: finalScore, onRestart: handleRestart })
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(App));
