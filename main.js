function isHtmlBalanced(html) {
    const stack = [];
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let match;

    while ((match = tagPattern.exec(html)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        
        // Skip self-closing tags
        if (fullTag.endsWith('/>') || ['br', 'hr', 'img', 'input'].includes(tagName)) {
            continue;
        }
        
        if (fullTag.startsWith('</')) {
            // Closing tag
            if (stack.length === 0 || stack.pop() !== tagName) {
                return false;
            }
        } else {
            // Opening tag
            stack.push(tagName);
        }
    }
    
    return stack.length === 0;
}

function parseQuizHTML(htmlContent) {
    const questions = [];
    let currentIndex = 0;
    
    while (currentIndex < htmlContent.length) {
        // Find question holder div
        const questionHolderStart = htmlContent.indexOf('class="quiz_sortable question_holder "', currentIndex);
        if (questionHolderStart === -1) break;
        
        // Find the complete question holder div by finding its closing tag
        const questionHolderDivStart = htmlContent.lastIndexOf('<div', questionHolderStart);
        let divBalance = 0;
        let questionHolderEnd = questionHolderDivStart;
        
        // Find the matching closing div for the question holder
        while (questionHolderEnd < htmlContent.length) {
            const nextDiv = htmlContent.indexOf('<div', questionHolderEnd + 1);
            const nextCloseDiv = htmlContent.indexOf('</div>', questionHolderEnd + 1);
            
            if (nextCloseDiv === -1) break;
            
            if (nextDiv !== -1 && nextDiv < nextCloseDiv) {
                divBalance++;
                questionHolderEnd = nextDiv + 4;
            } else {
                if (divBalance === 0) {
                    questionHolderEnd = nextCloseDiv + 6;
                    break;
                }
                divBalance--;
                questionHolderEnd = nextCloseDiv + 6;
            }
        }
        
        const questionSection = htmlContent.substring(questionHolderDivStart, questionHolderEnd);
        
        // Extract question text
        const questionTextStart = questionSection.indexOf('class="question_text user_content enhanced">');
        if (questionTextStart === -1) {
            currentIndex = questionHolderEnd;
            continue;
        }
        
        const questionContentStart = questionTextStart + 'class="question_text user_content enhanced">'.length;
        const questionContentEnd = questionSection.indexOf('</div>', questionContentStart);
        if (questionContentEnd === -1) {
            currentIndex = questionHolderEnd;
            continue;
        }
        
        let questionText = questionSection.substring(questionContentStart, questionContentEnd).trim();
        questionText = questionText.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
        
        // Extract answers
        const answersWrapperStart = questionSection.indexOf('<div class="answers_wrapper">');
        if (answersWrapperStart === -1) {
            currentIndex = questionHolderEnd;
            continue;
        }
        
        const answers = [];
        let correctAnswer = null;
        
        // Find all answer divs
        const answerPattern = /<div class="answer answer_for_[^"]*"[^>]*>/g;
        let answerMatch;
        
        while ((answerMatch = answerPattern.exec(questionSection)) !== null) {
            const answerDivStart = answerMatch.index;
            const answerDivTag = answerMatch[0];
            const isCorrect = answerDivTag.includes('correct_answer');
            
            // Find the answer text within this answer div
            const answerTextStart = questionSection.indexOf('<div class="answer_text">', answerDivStart);
            if (answerTextStart === -1) continue;
            
            const answerContentStart = answerTextStart + '<div class="answer_text">'.length;
            const answerContentEnd = questionSection.indexOf('</div>', answerContentStart);
            if (answerContentEnd === -1) continue;
            
            const answerText = questionSection.substring(answerContentStart, answerContentEnd).trim();
            if (answerText) {
                answers.push(answerText);
                if (isCorrect) {
                    correctAnswer = answerText;
                }
            }
        }
        
        // Only add question if we found valid content
        if (questionText && answers.length > 0) {
            questions.push({
                question: questionText,
                answers: answers,
                correctAnswer: correctAnswer
            });
        }
        
        currentIndex = questionHolderEnd;
    }
    
    return questions;
}

// Alternative simpler parsing approach (maybe not needed)
function parseQuizQuestionsSimple(html) {
    const questionsArr = [];
    const htmlLines = html.split('\n');
    
    let inQuestionHolder = false;
    let questionBuffer = '';
    let braceCount = 0;
    
    for (let i = 0; i < htmlLines.length; i++) {
        const line = htmlLines[i].trim();
        
        // Check for question holder start
        if (line.includes('class="quiz_sortable question_holder "')) {
            inQuestionHolder = true;
            questionBuffer = '';
            braceCount = 0;
        }
        
        if (inQuestionHolder) {
            questionBuffer += line + '\n';
            
            // Count div tags to track nesting
            const openDivs = (line.match(/<div/g) || []).length;
            const closeDivs = (line.match(/<\/div>/g) || []).length;
            braceCount += openDivs - closeDivs;
            
            // If we've closed all divs, we've reached the end of this question
            if (braceCount <= 0 && questionBuffer.length > 100) {
                const parsed = parseQuizHTML(questionBuffer);
                if (parsed.length > 0) {
                    questionsArr.push(...parsed);
                }
                inQuestionHolder = false;
                questionBuffer = '';
            }
        }
    }
    
    return questionsArr;
}
function jsonToQuizlet(quizData) {
  // quizlet quizletFormat 
  // <$Question1>, <$Answer>
  // <$Question2>, <$Answer>
  // ...
  let quizletFormat = "";
  quizData.forEach(item => {
    // json format
    //      question: questionText,
    //      answers: answers,
    //      correctAnswer: correctAnswer
    quizletFormat += `${item.question}, ${item.correctAnswer}\n`;
  });
  return quizletFormat; 
}
function main() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz HTML Examples</title>
</head>
<body>
    <h2>Example 1:</h2>
    <div role="region" aria-label="Question" class="quiz_sortable question_holder " id="" style="" data-group-id="">
      <div style="display: block; height: 1px; overflow: hidden;">&nbsp;</div>
      <a name="question_103746433"></a>
      <div class="display_question question multiple_choice_question incorrect bordered" id="question_103746433"><span class="answer_indicator incorrect" id="question_103746433_arrow">Incorrect answer</span>
        
    <div class="move">
      <a tabindex="0" class="draggable-handle" role="button">
        <i class="icon-drag-handle">
          <span class="screenreader-only">Move To...</span>
          <span class="accessibility-warning screenreader-only">
            This element is a more accessible alternative to drag &amp; drop reordering. Press Enter or Space to move this question.
          </span>
        </i>
      </a>
    </div>

        <div class="header">
          <span class="name question_name" role="heading" aria-level="2">Question 2</span>
          <span class="question_points_holder" style="">
            <div class="user_points">
                    0
              <span class="points question_points"> / 1</span> pts
            </div>
        </span>
        </div>
          <div class="links" style="display: none;">
            <a href="#" class="edit_question_link no-hover" title="Edit this Question"><i class="icon-edit standalone-icon"><span class="screenreader-only">Edit this Question</span></i></a>
              <a href="#" class="delete_question_link no-hover" title="Delete this Question"><i class="icon-end standalone-icon"><span class="screenreader-only">Delete this Question</span></i></a>
          </div>
        <div style="display: none;">
          <span class="regrade_option"></span>
          <span class="regrade_disabled">0</span>
          <span class="question_type">multiple_choice_question</span>
          <span class="answer_selection_type"></span>
            <a href="/courses/1683555/quizzes/4627579/questions/103746433" class="update_question_url">&nbsp;</a>
          <span class="assessment_question_id">236696901</span>
        </div>
        <div class="text">
          <div class="original_question_text" style="display: none;">
            <textarea disabled="" style="display: none;" name="text_after_answers" class="textarea_text_after_answers"></textarea>
            <textarea disabled="" style="display: none;" name="question_text" class="textarea_question_text">The largest artery in the human body is the &lt;br&gt;</textarea>
          </div>
          <div id="question_103746433_question_text" class="question_text user_content enhanced">
              The largest artery in the human body is the <br>
          </div>
          <div class="answers">
                    <div class="answers_wrapper">
                      
        <div class="answer answer_for_
             
             
             
             
             selected_answer" id="answer_7956" style="" title="pulmonary artery.. You selected this answer."><span class="answer_arrow incorrect" aria-label="Incorrect!" id="answer_7956_arrow"></span>

          <span class="hidden id">7956</span>

        <div class="select_answer answer_type">
            <input id="answer-7956" name="question-103746433" type="radio" checked="" class="question_input" aria-disabled="true" disabled="" aria-describedby="answer_7956_arrow">&nbsp;
          <label for="answer-7956">
            <div class="answer_text">pulmonary artery.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
             correct_answer" id="answer_83278" style="" title="aorta.. This was the correct answer."><span class="answer_arrow correct" aria-label="Correct!" id="answer_83278_arrow"></span>

          <span class="hidden id">83278</span>

        <div class="select_answer answer_type">
            <input id="answer-83278" name="question-103746433" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="answer_83278_arrow">&nbsp;
          <label for="answer-83278">
            <div class="answer_text">aorta.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
              " id="answer_3956" style="" title="carotid artery..">

          <span class="hidden id">3956</span>

        <div class="select_answer answer_type">
            <input id="answer-3956" name="question-103746433" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746433_arrow">&nbsp;
          <label for="answer-3956">
            <div class="answer_text">carotid artery.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
              " id="answer_86723" style="" title="femoral artery..">

          <span class="hidden id">86723</span>

        <div class="select_answer answer_type">
            <input id="answer-86723" name="question-103746433" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746433_arrow">&nbsp;
          <label for="answer-86723">
            <div class="answer_text">femoral artery.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
              " id="answer_57923" style="" title="subclavian artery..">

          <span class="hidden id">57923</span>

        <div class="select_answer answer_type">
            <input id="answer-57923" name="question-103746433" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746433_arrow">&nbsp;
          <label for="answer-57923">
            <div class="answer_text">subclavian artery.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

                    </div>
          </div>
          <div class="after_answers">
          </div>
        </div>
          
        <div class="clear"></div>
      </div>
    </div>

    <hr style="margin: 40px 0;">

    <h2>Example 2:</h2>
    <div role="region" aria-label="Question" class="quiz_sortable question_holder " id="" style="" data-group-id="">
      <div style="display: block; height: 1px; overflow: hidden;">&nbsp;</div>
      <a name="question_103746434"></a>
      <div class="display_question question multiple_choice_question correct bordered" id="question_103746434"><span class="answer_indicator correct" id="question_103746434_arrow">Correct answer</span>
        
    <div class="move">
      <a tabindex="0" class="draggable-handle" role="button">
        <i class="icon-drag-handle">
          <span class="screenreader-only">Move To...</span>
          <span class="accessibility-warning screenreader-only">
            This element is a more accessible alternative to drag &amp; drop reordering. Press Enter or Space to move this question.
          </span>
        </i>
      </a>
    </div>

        <div class="header">
          <span class="name question_name" role="heading" aria-level="2">Question 3</span>
          <span class="question_points_holder" style="">
            <div class="user_points">
                    1
              <span class="points question_points"> / 1</span> pts
            </div>
        </span>
        </div>
          <div class="links" style="display: none;">
            <a href="#" class="edit_question_link no-hover" title="Edit this Question"><i class="icon-edit standalone-icon"><span class="screenreader-only">Edit this Question</span></i></a>
              <a href="#" class="delete_question_link no-hover" title="Delete this Question"><i class="icon-end standalone-icon"><span class="screenreader-only">Delete this Question</span></i></a>
          </div>
        <div style="display: none;">
          <span class="regrade_option"></span>
          <span class="regrade_disabled">0</span>
          <span class="question_type">multiple_choice_question</span>
          <span class="answer_selection_type"></span>
            <a href="/courses/1683555/quizzes/4627579/questions/103746434" class="update_question_url">&nbsp;</a>
          <span class="assessment_question_id">236696902</span>
        </div>
        <div class="text">
          <div class="original_question_text" style="display: none;">
            <textarea disabled="" style="display: none;" name="text_after_answers" class="textarea_text_after_answers"></textarea>
            <textarea disabled="" style="display: none;" name="question_text" class="textarea_question_text">The smallest functional unit of the kidney is the &lt;br&gt;</textarea>
          </div>
          <div id="question_103746434_question_text" class="question_text user_content enhanced">
              The smallest functional unit of the kidney is the <br>
          </div>
          <div class="answers">
                    <div class="answers_wrapper">
                      
        <div class="answer answer_for_
             
             
             
             
              " id="answer_7957" style="" title="glomerulus..">

          <span class="hidden id">7957</span>

        <div class="select_answer answer_type">
            <input id="answer-7957" name="question-103746434" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746434_arrow">&nbsp;
          <label for="answer-7957">
            <div class="answer_text">glomerulus.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
             selected_answer correct_answer" id="answer_83279" style="" title="nephron.. You selected this answer. This was the correct answer."><span class="answer_arrow correct" aria-label="Correct!" id="answer_83279_arrow"></span>

          <span class="hidden id">83279</span>

        <div class="select_answer answer_type">
            <input id="answer-83279" name="question-103746434" type="radio" checked="" class="question_input" aria-disabled="true" disabled="" aria-describedby="answer_83279_arrow">&nbsp;
          <label for="answer-83279">
            <div class="answer_text">nephron.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
              " id="answer_3957" style="" title="collecting duct..">

          <span class="hidden id">3957</span>

        <div class="select_answer answer_type">
            <input id="answer-3957" name="question-103746434" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746434_arrow">&nbsp;
          <label for="answer-3957">
            <div class="answer_text">collecting duct.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
              " id="answer_86724" style="" title="loop of Henle..">

          <span class="hidden id">86724</span>

        <div class="select_answer answer_type">
            <input id="answer-86724" name="question-103746434" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746434_arrow">&nbsp;
          <label for="answer-86724">
            <div class="answer_text">loop of Henle.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

        <div class="answer answer_for_
             
             
             
             
              " id="answer_57924" style="" title="renal corpuscle..">

          <span class="hidden id">57924</span>

        <div class="select_answer answer_type">
            <input id="answer-57924" name="question-103746434" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746434_arrow">&nbsp;
          <label for="answer-57924">
            <div class="answer_text">renal corpuscle.</div>
            <div class="answer_html"></div>
          </label>
        </div>
        </div>

                    </div>
          </div>
          <div class="after_answers">
          </div>
        </div>
          
        <div class="clear"></div>
      </div>
    </div>
</body>
</html>
`;

    console.log("=== Testing HTML Balance ===");
    const testCases = ["<>", "<<>>", "<div></div>", "<div><span></span></div>"];
    testCases.forEach(test => {
        console.log(`Testing: "${test}" : ${isHtmlBalanced(test)}`);
    });

    console.log("\n=== Parsing Quiz Questions ===");
    
    // Method 1: Direct parsing
    const parsedQuestions = parseQuizHTML(html);
    console.log("Direct parsing found:", parsedQuestions.length, "questions");
    console.log(JSON.stringify(parsedQuestions, null, 2));
    
    
    
    // json format
    //      question: questionText,
    //      answers: answers,
    //      correctAnswer: correctAnswer

    console.log("\n=== Alternative Simple Parsing ===");
    
    // Method 2: Line-by-line parsing
    const simpleQuestions = parseQuizQuestionsSimple(html);
    console.log("Simple parsing found:", simpleQuestions.length, "questions");
    
    if (parsedQuestions.length > 0) {
        console.log("\n=== Success! ===");
        console.log("Question:", parsedQuestions[0].question);
        console.log("Number of answers:", parsedQuestions[0].answers.length);
        console.log("Correct answer:", parsedQuestions[0].correctAnswer);
    }
    console.log("\n=== Quizlet Import Data ===");
    const quizletQuestions = jsonToQuizlet(parsedQuestions);
    console.log(quizletQuestions);
}

main();
export default main;
