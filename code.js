// ==========================================
// 간단한 딥러닝 학습 원리 시뮬레이션
// 주제: 변수 1을 입력하면 변수 2를 예측하는 모델
// 핵심 흐름: 예측 → 오차 계산 → 가중치 수정 → 반복 학습
// ==========================================

// 예시 이름을 없애고, 숫자 데이터만 남겼습니다.
// input: 변수 1, target: 변수 2의 실제값
const defaultTrainingData = [];

// 화면 요소를 변수에 저장하면 코드를 더 읽기 쉽게 만들 수 있습니다.
const inputValue = document.querySelector("#inputValue");
const targetValue = document.querySelector("#targetValue");
const addDataButton = document.querySelector("#addDataButton");
const resetDataButton = document.querySelector("#resetDataButton");
const trainButton = document.querySelector("#trainButton");
const singleStepButton = document.querySelector("#singleStepButton");
const resetLearningButton = document.querySelector("#resetLearningButton");
const dataTableBody = document.querySelector("#dataTableBody");
const compareInputValue = document.querySelector("#compareInputValue");

const currentWeightText = document.querySelector("#currentWeight");
const currentErrorText = document.querySelector("#currentError");
const currentPredictionText = document.querySelector("#currentPrediction");
const learningCountText = document.querySelector("#learningCount");
const beforePredictionText = document.querySelector("#beforePrediction");
const afterPredictionText = document.querySelector("#afterPrediction");
const weightBadge = document.querySelector("#weightBadge");
const flowSteps = document.querySelectorAll(".flow-step");

// 학습 상태를 저장하는 변수들입니다.
let trainingData = [...defaultTrainingData];
const defaultWeight = 5;
let weight = defaultWeight;
let startWeight = weight;
let learningCount = 0;
let learningRate = 0.002;
let isTraining = false;
let trainingTimer = null;
let errorHistory = [];
let errorChart = null;

// 입력값에 가중치를 곱해서 예측값을 계산합니다.
function predictValue(input) {
  return input * weight;
}

// 예측값과 실제값의 차이를 이용해 평균 오차를 계산합니다.
// 여기서는 이해하기 쉽게 "절댓값 오차"의 평균을 사용합니다.
function calculateAverageError() {
  if (trainingData.length === 0) {
    return 0;
  }

  let totalError = 0;

  trainingData.forEach((data) => {
    const prediction = predictValue(data.input);
    const error = Math.abs(data.target - prediction);
    totalError += error;
  });

  return totalError / trainingData.length;
}

// 데이터 하나를 기준으로 가중치를 조금 수정합니다.
// 실제값보다 예측이 낮으면 weight를 올리고, 예측이 높으면 weight를 내립니다.
function trainOneData(data) {
  const prediction = predictValue(data.input);
  const error = data.target - prediction;

  // 오차와 입력값을 이용해 가중치를 어느 방향으로 바꿀지 정합니다.
  weight = weight + learningRate * error * data.input;
}

// 전체 데이터를 한 번씩 보면서 학습합니다.
function trainOneEpoch() {
  if (trainingData.length === 0) {
    alert("먼저 변수 1과 변수 2 데이터를 추가해주세요.");
    stopAutoTraining();
    return;
  }

  trainingData.forEach((data) => {
    trainOneData(data);
  });

  learningCount += 1;
  errorHistory.push(calculateAverageError());

  showLearningFlow();
  updateScreen();
}

// 학습 과정을 단계별로 강조해 "반복 학습" 흐름이 보이게 합니다.
function showLearningFlow() {
  const activeIndex = learningCount % flowSteps.length;

  flowSteps.forEach((step, index) => {
    step.classList.toggle("active", index === activeIndex);
  });
}

// 사용자가 입력한 데이터를 학습 데이터 목록에 추가합니다.
function addTrainingData() {
  const input = Number(inputValue.value);
  const target = Number(targetValue.value);

  if (Number.isNaN(input) || Number.isNaN(target)) {
    alert("변수 1과 변수 2 실제값을 숫자로 입력해주세요.");
    return;
  }

  trainingData.push({ input, target });
  updateScreen();
}

// 학습 데이터를 처음 예시로 되돌립니다.
function resetTrainingData() {
  trainingData = [...defaultTrainingData];
  resetLearning();
}

// 가중치와 학습 횟수를 처음 상태로 되돌립니다.
function resetLearning() {
  stopAutoTraining();
  weight = defaultWeight;
  startWeight = weight;
  learningCount = 0;
  errorHistory = [calculateAverageError()];
  showFirstFlowStep();
  updateScreen();
}

function showFirstFlowStep() {
  flowSteps.forEach((step, index) => {
    step.classList.toggle("active", index === 0);
  });
}

// 버튼을 누르면 자동으로 여러 번 학습합니다.
function toggleAutoTraining() {
  if (isTraining) {
    stopAutoTraining();
    return;
  }

  isTraining = true;
  trainButton.textContent = "학습 정지";

  // 0.18초마다 한 번씩 학습해서 변화가 눈에 보이도록 했습니다.
  trainingTimer = setInterval(() => {
    trainOneEpoch();

    // 발표용 화면에서 너무 오래 돌지 않도록 120회에서 자동 정지합니다.
    if (learningCount >= 120) {
      stopAutoTraining();
    }
  }, 180);
}

function stopAutoTraining() {
  isTraining = false;
  trainButton.textContent = "학습 시작";

  if (trainingTimer !== null) {
    clearInterval(trainingTimer);
    trainingTimer = null;
  }
}

// 학습 데이터 표를 다시 그립니다.
function renderDataTable() {
  dataTableBody.innerHTML = "";

  if (trainingData.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="3">아직 추가된 데이터가 없습니다.</td>
    `;
    dataTableBody.appendChild(emptyRow);
    return;
  }

  trainingData.forEach((data) => {
    const row = document.createElement("tr");
    const prediction = predictValue(data.input);

    row.innerHTML = `
      <td>${data.input}</td>
      <td>${data.target}</td>
      <td>${prediction.toFixed(2)}</td>
    `;

    dataTableBody.appendChild(row);
  });
}

// Chart.js가 정상적으로 불러와졌을 때 오차 그래프를 준비합니다.
function createErrorChart() {
  const chartCanvas = document.querySelector("#errorChart");

  if (typeof Chart === "undefined") {
    drawSimpleFallbackChart(chartCanvas);
    return;
  }

  errorChart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: errorHistory.map((_, index) => index),
      datasets: [
        {
          label: "평균 오차",
          data: errorHistory,
          borderColor: "#36a3ff",
          backgroundColor: "rgba(54, 163, 255, 0.16)",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#edf6ff"
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "학습 횟수",
            color: "#9db2ca"
          },
          ticks: {
            color: "#9db2ca"
          },
          grid: {
            color: "rgba(157, 178, 202, 0.16)"
          }
        },
        y: {
          title: {
            display: true,
            text: "평균 오차",
            color: "#9db2ca"
          },
          ticks: {
            color: "#9db2ca"
          },
          grid: {
            color: "rgba(157, 178, 202, 0.16)"
          }
        }
      }
    }
  });
}

// Chart.js를 사용할 수 없을 때도 빈 화면이 되지 않도록 간단한 선 그래프를 직접 그립니다.
function drawSimpleFallbackChart(canvas) {
  const context = canvas.getContext("2d");
  const chartBox = canvas.parentElement;
  const width = chartBox.clientWidth;
  const height = 300;
  const padding = 28;

  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(157, 178, 202, 0.35)";
  context.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

  if (errorHistory.length < 2) {
    return;
  }

  const maxError = Math.max(...errorHistory);
  const minError = Math.min(...errorHistory);
  const range = maxError - minError || 1;

  context.beginPath();
  context.strokeStyle = "#36a3ff";
  context.lineWidth = 3;

  errorHistory.forEach((error, index) => {
    const x = padding + (index / (errorHistory.length - 1)) * (width - padding * 2);
    const y = height - padding - ((error - minError) / range) * (height - padding * 2);

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.stroke();
}

// 그래프 데이터를 현재 학습 상태에 맞게 갱신합니다.
function updateChart() {
  const chartCanvas = document.querySelector("#errorChart");

  if (errorChart) {
    errorChart.data.labels = errorHistory.map((_, index) => index);
    errorChart.data.datasets[0].data = errorHistory;
    errorChart.update();
  } else {
    drawSimpleFallbackChart(chartCanvas);
  }
}

// 학습 전후 비교 영역을 갱신합니다.
function updatePredictionComparison() {
  const compareInput = Number(compareInputValue.value);

  if (compareInputValue.value === "") {
    beforePredictionText.textContent = "-";
    afterPredictionText.textContent = "-";
    return;
  }

  const beforePrediction = compareInput * startWeight;
  const afterPrediction = compareInput * weight;

  beforePredictionText.textContent = beforePrediction.toFixed(2);
  afterPredictionText.textContent = afterPrediction.toFixed(2);
}

// 화면에 보이는 모든 숫자와 표, 그래프를 최신 상태로 바꿉니다.
function updateScreen() {
  const averageError = calculateAverageError();
  const sampleInput = Number(compareInputValue.value);
  const samplePrediction = compareInputValue.value === "" ? null : predictValue(sampleInput);

  currentWeightText.textContent = weight.toFixed(4);
  currentErrorText.textContent = averageError.toFixed(4);
  currentPredictionText.textContent = samplePrediction === null ? "-" : samplePrediction.toFixed(2);
  learningCountText.textContent = learningCount;
  weightBadge.textContent = `w = ${weight.toFixed(2)}`;

  renderDataTable();
  updatePredictionComparison();
  updateChart();
}

// 버튼과 입력창에 기능을 연결합니다.
addDataButton.addEventListener("click", addTrainingData);
resetDataButton.addEventListener("click", resetTrainingData);
trainButton.addEventListener("click", toggleAutoTraining);
singleStepButton.addEventListener("click", trainOneEpoch);
resetLearningButton.addEventListener("click", resetLearning);
compareInputValue.addEventListener("input", updateScreen);

// 페이지가 처음 열렸을 때 실행되는 초기 설정입니다.
errorHistory = [calculateAverageError()];
createErrorChart();
updateScreen();
