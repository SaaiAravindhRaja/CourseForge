import type { Course, Module, Lesson, QuizQuestion } from '@/types';

// Quiz type extracted from Module interface
type Quiz = {
  id: string;
  title: string;
  questions?: QuizQuestion[];
  passingScore: number;
};

// SCORM 1.2 and SCORM 2004 export functionality
// This creates a valid SCORM package that can be uploaded to any LMS

interface SCORMManifest {
  identifier: string;
  title: string;
  organizations: SCORMOrganization[];
  resources: SCORMResource[];
}

interface SCORMOrganization {
  identifier: string;
  title: string;
  items: SCORMItem[];
}

interface SCORMItem {
  identifier: string;
  title: string;
  href: string;
  children?: SCORMItem[];
}

interface SCORMResource {
  identifier: string;
  type: string;
  href: string;
  files: string[];
}

// Generate imsmanifest.xml for SCORM 1.2
function generateManifest(course: Course, version: '1.2' | '2004' = '1.2'): string {
  const namespace = version === '2004'
    ? 'http://www.imsglobal.org/xsd/imscp_v1p1'
    : 'http://www.imsproject.org/xsd/imscp_rootv1p1p2';

  const adlNamespace = version === '2004'
    ? 'http://www.adlnet.org/xsd/adlcp_v1p3'
    : 'http://www.adlnet.org/xsd/adlcp_rootv1p2';

  let items = '';
  let resources = '';

  course.modules.forEach((module, moduleIndex) => {
    const moduleId = `module_${moduleIndex + 1}`;
    let moduleItems = '';

    module.lessons.forEach((lesson, lessonIndex) => {
      const lessonId = `${moduleId}_lesson_${lessonIndex + 1}`;
      moduleItems += `
          <item identifier="${lessonId}" identifierref="RES_${lessonId}">
            <title>${escapeXml(lesson.title)}</title>
          </item>`;

      resources += `
    <resource identifier="RES_${lessonId}" type="webcontent" adlcp:scormType="sco" href="content/${lessonId}.html">
      <file href="content/${lessonId}.html"/>
    </resource>`;
    });

    // Add quiz if exists
    if (module.quiz) {
      const quizId = `${moduleId}_quiz`;
      moduleItems += `
          <item identifier="${quizId}" identifierref="RES_${quizId}">
            <title>${escapeXml(module.quiz.title || 'Module Quiz')}</title>
          </item>`;

      resources += `
    <resource identifier="RES_${quizId}" type="webcontent" adlcp:scormType="sco" href="content/${quizId}.html">
      <file href="content/${quizId}.html"/>
    </resource>`;
    }

    items += `
        <item identifier="${moduleId}">
          <title>${escapeXml(module.title)}</title>${moduleItems}
        </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="COURSE_${course.id}"
  xmlns="${namespace}"
  xmlns:adlcp="${adlNamespace}"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${version}</schemaversion>
  </metadata>
  <organizations default="ORG_${course.id}">
    <organization identifier="ORG_${course.id}">
      <title>${escapeXml(course.title)}</title>${items}
    </organization>
  </organizations>
  <resources>${resources}
    <resource identifier="RES_API" type="webcontent" href="scripts/scorm_api.js">
      <file href="scripts/scorm_api.js"/>
    </resource>
    <resource identifier="RES_STYLES" type="webcontent" href="styles/main.css">
      <file href="styles/main.css"/>
    </resource>
  </resources>
</manifest>`;
}

// Generate SCORM API wrapper
function generateSCORMAPI(): string {
  return `// SCORM 1.2 API Wrapper
// CourseForge SCORM Export

var scorm = {
  version: null,
  API: null,
  data: {},

  init: function() {
    this.API = this.findAPI(window);
    if (!this.API) {
      this.API = this.findAPI(window.opener);
    }
    if (!this.API) {
      this.API = this.findAPI(window.parent);
    }

    if (this.API) {
      var result = this.API.LMSInitialize("");
      if (result === "true" || result === true) {
        this.version = "1.2";
        return true;
      }
    }

    // Try SCORM 2004
    this.API = this.findAPI2004(window);
    if (this.API) {
      var result = this.API.Initialize("");
      if (result === "true" || result === true) {
        this.version = "2004";
        return true;
      }
    }

    console.warn("SCORM API not found - running in standalone mode");
    return false;
  },

  findAPI: function(win) {
    var attempts = 0;
    while (win && attempts < 10) {
      if (win.API) return win.API;
      if (win === win.parent) break;
      win = win.parent;
      attempts++;
    }
    return null;
  },

  findAPI2004: function(win) {
    var attempts = 0;
    while (win && attempts < 10) {
      if (win.API_1484_11) return win.API_1484_11;
      if (win === win.parent) break;
      win = win.parent;
      attempts++;
    }
    return null;
  },

  getValue: function(element) {
    if (!this.API) return this.data[element] || "";
    if (this.version === "2004") {
      return this.API.GetValue(element);
    }
    return this.API.LMSGetValue(element);
  },

  setValue: function(element, value) {
    this.data[element] = value;
    if (!this.API) return true;
    if (this.version === "2004") {
      return this.API.SetValue(element, value);
    }
    return this.API.LMSSetValue(element, value);
  },

  commit: function() {
    if (!this.API) return true;
    if (this.version === "2004") {
      return this.API.Commit("");
    }
    return this.API.LMSCommit("");
  },

  finish: function() {
    if (!this.API) return true;
    if (this.version === "2004") {
      return this.API.Terminate("");
    }
    return this.API.LMSFinish("");
  },

  setComplete: function() {
    if (this.version === "2004") {
      this.setValue("cmi.completion_status", "completed");
      this.setValue("cmi.success_status", "passed");
    } else {
      this.setValue("cmi.core.lesson_status", "completed");
    }
    this.commit();
  },

  setScore: function(score, max, min) {
    max = max || 100;
    min = min || 0;
    var scaled = (score - min) / (max - min);

    if (this.version === "2004") {
      this.setValue("cmi.score.raw", score);
      this.setValue("cmi.score.max", max);
      this.setValue("cmi.score.min", min);
      this.setValue("cmi.score.scaled", scaled);
    } else {
      this.setValue("cmi.core.score.raw", score);
      this.setValue("cmi.core.score.max", max);
      this.setValue("cmi.core.score.min", min);
    }
    this.commit();
  },

  trackTime: function(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = Math.floor(seconds % 60);

    if (this.version === "2004") {
      var duration = "PT" + hours + "H" + minutes + "M" + secs + "S";
      this.setValue("cmi.session_time", duration);
    } else {
      var time = this.padTime(hours) + ":" + this.padTime(minutes) + ":" + this.padTime(secs);
      this.setValue("cmi.core.session_time", time);
    }
    this.commit();
  },

  padTime: function(num) {
    return (num < 10 ? "0" : "") + num;
  }
};

// Initialize on load
document.addEventListener("DOMContentLoaded", function() {
  scorm.init();
});

// Save on unload
window.addEventListener("beforeunload", function() {
  scorm.finish();
});
`;
}

// Generate CSS for SCORM content
function generateStyles(): string {
  return `/* CourseForge SCORM Export Styles */

:root {
  --primary: #E24A12;
  --primary-dark: #BC3610;
  --text: #1A1816;
  --text-light: #6B655C;
  --bg: #FDFCFB;
  --card: #FFFFFF;
  --border: #E8E4DF;
  --success: #00A67E;
  --warning: #F59E0B;
  --error: #DC2626;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

h1, h2, h3 {
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 1rem;
}

h1 { font-size: 2rem; color: var(--primary); }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }

p { margin-bottom: 1rem; }

.lesson-header {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.lesson-header h1 {
  color: white;
  margin-bottom: 0.5rem;
}

.lesson-meta {
  opacity: 0.9;
  font-size: 0.875rem;
}

.content-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.objectives {
  background: #FEF7F0;
  border-left: 4px solid var(--primary);
  padding: 1.5rem;
  border-radius: 0 12px 12px 0;
  margin-bottom: 2rem;
}

.objectives h3 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.objectives ul {
  list-style: none;
  padding: 0;
}

.objectives li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.objectives li::before {
  content: "\\2713";
  color: var(--success);
  position: absolute;
  left: 0;
  font-weight: bold;
}

.key-takeaways {
  background: #ECFDF5;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.key-takeaways h3 {
  color: var(--success);
}

/* Quiz Styles */
.quiz-container {
  max-width: 700px;
  margin: 0 auto;
}

.question-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.question-number {
  display: inline-block;
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover {
  border-color: var(--primary);
  background: #FEF7F0;
}

.option.selected {
  border-color: var(--primary);
  background: #FEF7F0;
}

.option.correct {
  border-color: var(--success);
  background: #ECFDF5;
}

.option.incorrect {
  border-color: var(--error);
  background: #FEF2F2;
}

.option input {
  margin-right: 1rem;
}

.feedback {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  display: none;
}

.feedback.show {
  display: block;
}

.feedback.correct {
  background: #ECFDF5;
  color: var(--success);
}

.feedback.incorrect {
  background: #FEF2F2;
  color: var(--error);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--card);
  border: 2px solid var(--border);
  color: var(--text);
}

.btn-secondary:hover {
  border-color: var(--primary);
}

.quiz-results {
  text-align: center;
  padding: 2rem;
  background: var(--card);
  border-radius: 12px;
  margin-top: 2rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.score-circle span {
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.navigation {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border);
  margin-top: 2rem;
}

@media (max-width: 768px) {
  body { padding: 1rem; }
  .lesson-header { padding: 1.5rem; }
  h1 { font-size: 1.5rem; }
}
`;
}

// Generate lesson HTML
function generateLessonHTML(
  lesson: Lesson,
  module: Module,
  course: Course,
  lessonIndex: number,
  moduleIndex: number
): string {
  const objectives = module.objectives?.map((obj) => `<li>${escapeXml(obj.text)}</li>`).join('\n') || '';

  const keyTakeaways =
    lesson.keyTakeaways?.map((kt) => `<li>${escapeXml(kt)}</li>`).join('\n') || '';

  const content = lesson.content
    ? lesson.content
        .split('\n')
        .map((p) => (p.trim() ? `<p>${escapeXml(p)}</p>` : ''))
        .join('\n')
    : '<p>Content coming soon...</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(lesson.title)} - ${escapeXml(course.title)}</title>
  <link rel="stylesheet" href="../styles/main.css">
  <script src="../scripts/scorm_api.js"></script>
</head>
<body>
  <div class="lesson-header">
    <div class="lesson-meta">Module ${moduleIndex + 1}: ${escapeXml(module.title)}</div>
    <h1>${escapeXml(lesson.title)}</h1>
  </div>

  ${
    objectives
      ? `
  <div class="objectives">
    <h3>Learning Objectives</h3>
    <ul>
      ${objectives}
    </ul>
  </div>
  `
      : ''
  }

  <div class="content-card">
    ${content}
  </div>

  ${
    keyTakeaways
      ? `
  <div class="key-takeaways">
    <h3>Key Takeaways</h3>
    <ul>
      ${keyTakeaways}
    </ul>
  </div>
  `
      : ''
  }

  <div class="navigation">
    <button class="btn btn-secondary" onclick="history.back()">Previous</button>
    <button class="btn btn-primary" onclick="completeLesson()">Mark Complete & Continue</button>
  </div>

  <script>
    var startTime = new Date();

    function completeLesson() {
      var duration = Math.floor((new Date() - startTime) / 1000);
      scorm.trackTime(duration);
      scorm.setComplete();
      // Navigate to next lesson or module
      alert('Lesson completed! Click OK to continue.');
    }
  </script>
</body>
</html>`;
}

// Generate quiz HTML
function generateQuizHTML(quiz: Quiz, module: Module, course: Course, moduleIndex: number): string {
  const questions = quiz.questions || [];
  const questionsHTML = questions
    .map(
      (q, i) => `
    <div class="question-card" id="question-${i}">
      <span class="question-number">Question ${i + 1}</span>
      <p class="question-text">${escapeXml(q.question)}</p>
      <div class="options">
        ${(q.options || [])
          .map(
            (opt, j) => `
          <label class="option" data-question="${i}" data-option="${j}">
            <input type="radio" name="q${i}" value="${j}">
            <span>${escapeXml(opt)}</span>
          </label>
        `
          )
          .join('')}
      </div>
      <div class="feedback" id="feedback-${i}">
        ${q.explanation ? `<p>${escapeXml(q.explanation)}</p>` : ''}
      </div>
    </div>
  `
    )
    .join('');

  const correctAnswers = questions.map((q) => q.correctAnswer);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(quiz.title || 'Module Quiz')} - ${escapeXml(course.title)}</title>
  <link rel="stylesheet" href="../styles/main.css">
  <script src="../scripts/scorm_api.js"></script>
</head>
<body>
  <div class="quiz-container">
    <div class="lesson-header">
      <div class="lesson-meta">Module ${moduleIndex + 1}: ${escapeXml(module.title)}</div>
      <h1>${escapeXml(quiz.title || 'Module Quiz')}</h1>
      <p>Test your knowledge from this module</p>
    </div>

    <form id="quiz-form">
      ${questionsHTML}

      <div class="navigation">
        <button type="button" class="btn btn-secondary" onclick="history.back()">Back to Lessons</button>
        <button type="submit" class="btn btn-primary">Submit Quiz</button>
      </div>
    </form>

    <div class="quiz-results" id="results" style="display: none;">
      <div class="score-circle">
        <span id="score-display">0%</span>
      </div>
      <h2 id="result-title">Quiz Complete!</h2>
      <p id="result-message"></p>
      <button class="btn btn-primary" onclick="location.reload()">Retry Quiz</button>
    </div>
  </div>

  <script>
    var correctAnswers = ${JSON.stringify(correctAnswers)};
    var passingScore = ${quiz.passingScore || 70};
    var startTime = new Date();

    document.querySelectorAll('.option').forEach(function(option) {
      option.addEventListener('click', function() {
        var questionNum = this.dataset.question;
        document.querySelectorAll('[data-question="' + questionNum + '"]').forEach(function(opt) {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
        this.querySelector('input').checked = true;
      });
    });

    document.getElementById('quiz-form').addEventListener('submit', function(e) {
      e.preventDefault();

      var score = 0;
      var total = correctAnswers.length;

      correctAnswers.forEach(function(correct, i) {
        var selected = document.querySelector('input[name="q' + i + '"]:checked');
        var options = document.querySelectorAll('[data-question="' + i + '"]');
        var feedback = document.getElementById('feedback-' + i);

        if (selected) {
          var answer = parseInt(selected.value);
          if (answer === correct) {
            score++;
            options[answer].classList.add('correct');
            feedback.classList.add('correct');
          } else {
            options[answer].classList.add('incorrect');
            options[correct].classList.add('correct');
            feedback.classList.add('incorrect');
          }
        } else {
          options[correct].classList.add('correct');
        }
        feedback.classList.add('show');
      });

      var percentage = Math.round((score / total) * 100);
      var duration = Math.floor((new Date() - startTime) / 1000);

      // Report to SCORM
      scorm.setScore(percentage, 100, 0);
      scorm.trackTime(duration);

      if (percentage >= passingScore) {
        scorm.setComplete();
      }

      // Show results
      document.getElementById('quiz-form').querySelector('.navigation').style.display = 'none';
      document.getElementById('results').style.display = 'block';
      document.getElementById('score-display').textContent = percentage + '%';
      document.getElementById('result-title').textContent = percentage >= passingScore ? 'Congratulations!' : 'Keep Practicing!';
      document.getElementById('result-message').textContent = 'You scored ' + score + ' out of ' + total + ' (' + percentage + '%).' +
        (percentage >= passingScore ? ' You passed!' : ' Passing score is ' + passingScore + '%.');
    });
  </script>
</body>
</html>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main export function that creates a downloadable ZIP
export async function exportToSCORM(
  course: Course,
  version: '1.2' | '2004' = '1.2'
): Promise<Blob> {
  // We'll create a simple structure that can be zipped client-side
  // In production, you'd use a library like JSZip

  const files: Record<string, string> = {
    'imsmanifest.xml': generateManifest(course, version),
    'scripts/scorm_api.js': generateSCORMAPI(),
    'styles/main.css': generateStyles(),
  };

  // Generate lesson files
  course.modules.forEach((module, moduleIndex) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      const filename = `content/module_${moduleIndex + 1}_lesson_${lessonIndex + 1}.html`;
      files[filename] = generateLessonHTML(lesson, module, course, lessonIndex, moduleIndex);
    });

    // Generate quiz file
    if (module.quiz) {
      const filename = `content/module_${moduleIndex + 1}_quiz.html`;
      files[filename] = generateQuizHTML(module.quiz, module, course, moduleIndex);
    }
  });

  // Create a JSON structure for download (actual ZIP would use JSZip)
  const packageData = {
    format: `SCORM ${version}`,
    course: course.title,
    files: files,
    exportDate: new Date().toISOString(),
  };

  return new Blob([JSON.stringify(packageData, null, 2)], {
    type: 'application/json',
  });
}

// Export individual SCORM components for preview
export { generateManifest, generateSCORMAPI, generateStyles, generateLessonHTML, generateQuizHTML };
