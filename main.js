import fs from "fs";

function parseQuizHTML(htmlContent) {
    const questions = [];
    let currentIndex = 0;
    
    while (currentIndex < htmlContent.length) {
        // Skip to QUESTION holder - updated to match actual structure
        const questionHolderStart = htmlContent.indexOf('class="quiz_sortable question_holder "', currentIndex);
        if (questionHolderStart === -1) break;
        
        // Skip to QUESTION TEXT - updated to match actual structure  
        const questionTextStart = htmlContent.indexOf('class="question_text user_content enhanced">', questionHolderStart);
        if (questionTextStart === -1) break;
        
        // Find the start of the actual question text (after the >)
        const questionContentStart = questionTextStart + 'class="question_text user_content enhanced">'.length;
        
        // Read until the closing </div> tag for question text
        const questionContentEnd = htmlContent.indexOf('</div>', questionContentStart);
        if (questionContentEnd === -1) break;
        
        let questionText = htmlContent.substring(questionContentStart, questionContentEnd).trim();
        // Clean up HTML tags like <br> in the question text
        questionText = questionText.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
        
        // Skip to ANSWERS wrapper - looking for the actual structure
        const answersWrapperStart = htmlContent.indexOf('<div class="answers_wrapper">', questionContentEnd);
        if (answersWrapperStart === -1) break;
        
        // Find the closing </div> for the answers_wrapper
        let answersWrapperEnd = answersWrapperStart + '<div class="answers_wrapper">'.length;
        let divCount = 1;
        let searchIndex = answersWrapperEnd;
        
        while (divCount > 0 && searchIndex < htmlContent.length) {
            const nextOpenDiv = htmlContent.indexOf('<div', searchIndex);
            const nextCloseDiv = htmlContent.indexOf('</div>', searchIndex);
            
            if (nextCloseDiv === -1) break;
            
            if (nextOpenDiv !== -1 && nextOpenDiv < nextCloseDiv) {
                divCount++;
                searchIndex = nextOpenDiv + 4;
            } else {
                divCount--;
                searchIndex = nextCloseDiv + 6;
                if (divCount === 0) {
                    answersWrapperEnd = nextCloseDiv;
                }
            }
        }
        
        // Extract all answers within the wrapper
        const answersSection = htmlContent.substring(answersWrapperStart, answersWrapperEnd);
        const answers = [];
        let correctAnswer = null;
        let answerIndex = 0;
        
        while (answerIndex < answersSection.length) {
            // Look for answer containers
            const answerDivStart = answersSection.indexOf('<div class="answer answer_for_', answerIndex);
            if (answerDivStart === -1) break;
            
            // Check if this is the correct answer by looking for "correct_answer" class
            const answerDivEnd = answersSection.indexOf('>', answerDivStart);
            const answerDivTag = answersSection.substring(answerDivStart, answerDivEnd);
            const isCorrect = answerDivTag.includes('correct_answer');
            
            // Skip to ANSWER TEXT within this answer div
            const answerTextStart = answersSection.indexOf('<div class="answer_text">', answerDivStart);
            if (answerTextStart === -1) {
                answerIndex = answerDivEnd;
                continue;
            }
            
            // Find the start of the actual answer text (after the >)
            const answerContentStart = answerTextStart + '<div class="answer_text">'.length;
            
            // Read until the closing </div> tag
            const answerContentEnd = answersSection.indexOf('</div>', answerContentStart);
            if (answerContentEnd === -1) break;
            
            const answerText = answersSection.substring(answerContentStart, answerContentEnd).trim();
            if (answerText) {
                answers.push(answerText);
                if (isCorrect) {
                    correctAnswer = answerText;
                }
            }
            
            answerIndex = answerContentEnd;
        }
        
        // Add the question, answers, and correct answer to our results
        questions.push({
            question: questionText,
            answers: answers,
            correctAnswer: correctAnswer
        });
        
        // Move to search for the next question
        currentIndex = answersWrapperEnd;
    }
    
    return questions;
}

// Example usage with the provided HTML:
/*
const parsedQuestions = parseQuizHTML(htmlContent);
console.log(JSON.stringify(parsedQuestions, null, 2));

// Expected output:
// [
//   {
//     "question": "Muscular ridges on the inner surface of the ventricles are called",
//     "answers": [
//       "coronary sinuses.",
//       "chordae tendineae.", 
//       "intercalated discs.",
//       "trabeculae carneae.",
//       "papillary muscles."
//     ],
//     "correctAnswer": "trabeculae carneae."
//   }
// ]
*/


function main() {

  let html = `
<div role="region" aria-label="Question" class="quiz_sortable question_holder " id="" style="" data-group-id="">
  <div style="display: block; height: 1px; overflow: hidden;">&nbsp;</div>
  <a name="question_103746432"></a>
  <div class="display_question question multiple_choice_question correct bordered" id="question_103746432"><span class="answer_indicator correct" id="question_103746432_arrow">Correct answer</span>
    
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
      <span class="name question_name" role="heading" aria-level="2">Question 1</span>
      <span class="question_points_holder" style="">
        <div class="user_points">
                0
          <span class="points question_points"> / 0</span> pts
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
        <a href="/courses/1683555/quizzes/4627579/questions/103746432" class="update_question_url">&nbsp;</a>
      <span class="assessment_question_id">236696900</span>
    </div>
    <div class="text">
      <div class="original_question_text" style="display: none;">
        <textarea disabled="" style="display: none;" name="text_after_answers" class="textarea_text_after_answers"></textarea>
        <textarea disabled="" style="display: none;" name="question_text" class="textarea_question_text">Muscular ridges on the inner surface of the ventricles are called &lt;br&gt;</textarea>
      </div>
      <div id="question_103746432_question_text" class="question_text user_content enhanced">
          Muscular ridges on the inner surface of the ventricles are called <br>
      </div>
      <div class="answers">
                <div class="answers_wrapper">
                  
    <div class="answer answer_for_
         
         
         
         
          " id="answer_7955" style="" title="coronary sinuses..">


      <span class="hidden id">7955</span>

    <div class="select_answer answer_type">
        <input id="answer-7955" name="question-103746432" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746432_arrow">&nbsp;
      <label for="answer-7955">
        <div class="answer_text">coronary sinuses.</div>
        <div class="answer_html"></div>
      </label>
    </div>
    <div class="answer_type short_answer" style="display:none;">
      <input name="answer_text" type="text" style="width: 161.5px; margin-bottom: 5px; color: rgb(0, 0, 0);" disabled="true" value="coronary sinuses.">
    </div>
    <div class="answer_match matching_answer answer_type" style="display:none;">
      <div class="answer_match_left">coronary sinuses.</div>
      <div class="answer_match_left_html" style="display:none;"></div>
      <div class="answer_match_middle">&nbsp;</div>
      <div class="answer_match_right">
              
      </div>
      <div class="clear"></div>
    </div>
    <div style="display: none;">
      <span class="numerical_answer_type">exact_answer</span>
      <span class="blank_id">none</span>
      <span class="question_id">103746432</span>
      <span class="id">7955</span>
      <span class="match_id"></span>
    </div>
      <div class="numerical_exact_answer answer_type" style="display:none;">
        <span class="answer_exact">0</span> (with margin: <span class="answer_error_margin">0</span>)
      </div>
      <div class="numerical_precision_answer answer_type" style="display:none;">
        <span class="answer_approximate">
          0
        </span> (with precision: <span class="answer_precision">10</span>)
      </div>
      <div class="numerical_range_answer answer_type" style="display:none;">
        Between <span class="answer_range_start">0</span> and <span class="answer_range_end">0</span>
      </div>
    <div class="numerical_range_answer answer_type" style="display:none;">
      <span class="answer_equation"></span>
      <span class="margin" style="display: none;">
        margin of error
        <span style="font-size: 0.8em;">
          +/-
        </span>
        <span class="answer_tolerance"></span>
      </span>
    </div>
      <span class="answer_weight" style="display: none;">0</span>

    <div class="clear"></div>
  </div>

    <div class="clear"></div>

    <div class="answer answer_for_
         
         
         
         
          " id="answer_83277" style="" title="chordae tendineae..">


      <span class="hidden id">83277</span>

    <div class="select_answer answer_type">
        <input id="answer-83277" name="question-103746432" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746432_arrow">&nbsp;
      <label for="answer-83277">
        <div class="answer_text">chordae tendineae.</div>
        <div class="answer_html"></div>
      </label>
    </div>
    <div class="answer_type short_answer" style="display:none;">
      <input name="answer_text" type="text" style="width: 171px; margin-bottom: 5px; color: rgb(0, 0, 0);" disabled="true" value="chordae tendineae.">
    </div>
    <div class="answer_match matching_answer answer_type" style="display:none;">
      <div class="answer_match_left">chordae tendineae.</div>
      <div class="answer_match_left_html" style="display:none;"></div>
      <div class="answer_match_middle">&nbsp;</div>
      <div class="answer_match_right">
              
      </div>
      <div class="clear"></div>
    </div>
    <div style="display: none;">
      <span class="numerical_answer_type">exact_answer</span>
      <span class="blank_id">none</span>
      <span class="question_id">103746432</span>
      <span class="id">83277</span>
      <span class="match_id"></span>
    </div>
      <div class="numerical_exact_answer answer_type" style="display:none;">
        <span class="answer_exact">0</span> (with margin: <span class="answer_error_margin">0</span>)
      </div>
      <div class="numerical_precision_answer answer_type" style="display:none;">
        <span class="answer_approximate">
          0
        </span> (with precision: <span class="answer_precision">10</span>)
      </div>
      <div class="numerical_range_answer answer_type" style="display:none;">
        Between <span class="answer_range_start">0</span> and <span class="answer_range_end">0</span>
      </div>
    <div class="numerical_range_answer answer_type" style="display:none;">
      <span class="answer_equation"></span>
      <span class="margin" style="display: none;">
        margin of error
        <span style="font-size: 0.8em;">
          +/-
        </span>
        <span class="answer_tolerance"></span>
      </span>
    </div>
      <span class="answer_weight" style="display: none;">0</span>

    <div class="clear"></div>
  </div>

    <div class="clear"></div>

    <div class="answer answer_for_
         
         
         
         
          " id="answer_3955" style="" title="intercalated discs..">


      <span class="hidden id">3955</span>

    <div class="select_answer answer_type">
        <input id="answer-3955" name="question-103746432" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746432_arrow">&nbsp;
      <label for="answer-3955">
        <div class="answer_text">intercalated discs.</div>
        <div class="answer_html"></div>
      </label>
    </div>
    <div class="answer_type short_answer" style="display:none;">
      <input name="answer_text" type="text" style="width: 180.5px; margin-bottom: 5px; color: rgb(0, 0, 0);" disabled="true" value="intercalated discs.">
    </div>
    <div class="answer_match matching_answer answer_type" style="display:none;">
      <div class="answer_match_left">intercalated discs.</div>
      <div class="answer_match_left_html" style="display:none;"></div>
      <div class="answer_match_middle">&nbsp;</div>
      <div class="answer_match_right">
              
      </div>
      <div class="clear"></div>
    </div>
    <div style="display: none;">
      <span class="numerical_answer_type">exact_answer</span>
      <span class="blank_id">none</span>
      <span class="question_id">103746432</span>
      <span class="id">3955</span>
      <span class="match_id"></span>
    </div>
      <div class="numerical_exact_answer answer_type" style="display:none;">
        <span class="answer_exact">0</span> (with margin: <span class="answer_error_margin">0</span>)
      </div>
      <div class="numerical_precision_answer answer_type" style="display:none;">
        <span class="answer_approximate">
          0
        </span> (with precision: <span class="answer_precision">10</span>)
      </div>
      <div class="numerical_range_answer answer_type" style="display:none;">
        Between <span class="answer_range_start">0</span> and <span class="answer_range_end">0</span>
      </div>
    <div class="numerical_range_answer answer_type" style="display:none;">
      <span class="answer_equation"></span>
      <span class="margin" style="display: none;">
        margin of error
        <span style="font-size: 0.8em;">
          +/-
        </span>
        <span class="answer_tolerance"></span>
      </span>
    </div>
      <span class="answer_weight" style="display: none;">0</span>

    <div class="clear"></div>
  </div>

    <div class="clear"></div>

    <div class="answer answer_for_
         
         
         
         
         selected_answer correct_answer" id="answer_86722" style="" title="trabeculae carneae.. You selected this answer. This was the correct answer."><span class="answer_arrow correct" aria-label="Correct!" id="answer_86722_arrow"></span>


      <span class="hidden id">86722</span>

    <div class="select_answer answer_type">
        <input id="answer-86722" name="question-103746432" type="radio" checked="" class="question_input" aria-disabled="true" disabled="" aria-describedby="answer_86722_arrow">&nbsp;
      <label for="answer-86722">
        <div class="answer_text">trabeculae carneae.</div>
        <div class="answer_html"></div>
      </label>
    </div>
    <div class="answer_type short_answer" style="display:none;">
      <input name="answer_text" type="text" style="width: 180.5px; margin-bottom: 5px; color: rgb(0, 0, 0);" disabled="true" value="trabeculae carneae.">
    </div>
    <div class="answer_match matching_answer answer_type" style="display:none;">
      <div class="answer_match_left">trabeculae carneae.</div>
      <div class="answer_match_left_html" style="display:none;"></div>
      <div class="answer_match_middle">&nbsp;</div>
      <div class="answer_match_right">
              
      </div>
      <div class="clear"></div>
    </div>
    <div style="display: none;">
      <span class="numerical_answer_type">exact_answer</span>
      <span class="blank_id">none</span>
      <span class="question_id">103746432</span>
      <span class="id">86722</span>
      <span class="match_id"></span>
    </div>
      <div class="numerical_exact_answer answer_type" style="display:none;">
        <span class="answer_exact">0</span> (with margin: <span class="answer_error_margin">0</span>)
      </div>
      <div class="numerical_precision_answer answer_type" style="display:none;">
        <span class="answer_approximate">
          0
        </span> (with precision: <span class="answer_precision">10</span>)
      </div>
      <div class="numerical_range_answer answer_type" style="display:none;">
        Between <span class="answer_range_start">0</span> and <span class="answer_range_end">0</span>
      </div>
    <div class="numerical_range_answer answer_type" style="display:none;">
      <span class="answer_equation"></span>
      <span class="margin" style="display: none;">
        margin of error
        <span style="font-size: 0.8em;">
          +/-
        </span>
        <span class="answer_tolerance"></span>
      </span>
    </div>
      <span class="answer_weight" style="display: none;">100</span>
      <div class="quiz_comment empty">
        <div class="answer_comment"></div>
        <div class="answer_comment_html"></div>
      </div>

    <div class="clear"></div>
  </div>

    <div class="clear"></div>

    <div class="answer answer_for_
         
         
         
         
          " id="answer_57922" style="" title="papillary muscles..">


      <span class="hidden id">57922</span>

    <div class="select_answer answer_type">
        <input id="answer-57922" name="question-103746432" type="radio" class="question_input" aria-disabled="true" disabled="" aria-describedby="question_103746432_arrow">&nbsp;
      <label for="answer-57922">
        <div class="answer_text">papillary muscles.</div>
        <div class="answer_html"></div>
      </label>
    </div>
    <div class="answer_type short_answer" style="display:none;">
      <input name="answer_text" type="text" style="width: 171px; margin-bottom: 5px; color: rgb(0, 0, 0);" disabled="true" value="papillary muscles.">
    </div>
    <div class="answer_match matching_answer answer_type" style="display:none;">
      <div class="answer_match_left">papillary muscles.</div>
      <div class="answer_match_left_html" style="display:none;"></div>
      <div class="answer_match_middle">&nbsp;</div>
      <div class="answer_match_right">
              
      </div>
      <div class="clear"></div>
    </div>
    <div style="display: none;">
      <span class="numerical_answer_type">exact_answer</span>
      <span class="blank_id">none</span>
      <span class="question_id">103746432</span>
      <span class="id">57922</span>
      <span class="match_id"></span>
    </div>
      <div class="numerical_exact_answer answer_type" style="display:none;">
        <span class="answer_exact">0</span> (with margin: <span class="answer_error_margin">0</span>)
      </div>
      <div class="numerical_precision_answer answer_type" style="display:none;">
        <span class="answer_approximate">
          0
        </span> (with precision: <span class="answer_precision">10</span>)
      </div>
      <div class="numerical_range_answer answer_type" style="display:none;">
        Between <span class="answer_range_start">0</span> and <span class="answer_range_end">0</span>
      </div>
    <div class="numerical_range_answer answer_type" style="display:none;">
      <span class="answer_equation"></span>
      <span class="margin" style="display: none;">
        margin of error
        <span style="font-size: 0.8em;">
          +/-
        </span>
        <span class="answer_tolerance"></span>
      </span>
    </div>
      <span class="answer_weight" style="display: none;">0</span>

    <div class="clear"></div>
  </div>

    <div class="clear"></div>

                </div>
      </div>
      <div class="after_answers">
      </div>
    </div>
      
    <div class="clear"></div>
  </div>
</div>
  
  `;

  // jump to class="question"
  // save div in array
  //  
  const questionDivs = parseQuizQuestions(html); 
  console.log("Found: "+questionDivs.length+" Questions");

  // needs to loop,
  //  for each div 
  //    save parsed question
  const parsedQuestions = parseQuizHTML(html);
  console.log(JSON.stringify(parsedQuestions, null, 2));

}
function parseQuizQuestions(html) { 
  let questionsArr = [];
  let divFormat = `
<div role="region" aria-label="Question" class="quiz_sortable question_holder " id="" style="" data-group-id="">
  `;
  
  let currentIndex = 0;
  const questionDiv = html.indexOf(divFormat, currentIndex);
  if (questionDiv !== null) {
    console.log(questionDiv+" found at "+questionDiv);
    currentIndex++;
  }


  //questionsArr.push({
  //  html: divData, 
  //});
  

  return questionsArr;
}
main();
export default main;
