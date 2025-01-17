import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import logo from '../../../../assets/images/user/Logo enlarged-03.png';
import './Quizzing.css';
import CKEditorViewer from '../../../../components/ckeditor/ckeditorviewer';


function Quizzing() {
  const navigate = useNavigate(); 
  const [questionData, setQuestionData] = useState(null); // State to store the fetched question data
  const [answer, setAnswer] = useState([]); // State to track the selected answer (if applicable)
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeElapsed, setTimeElapsed]=useState(0);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const code = window.location.pathname.split('/')[2];

        const response = await fetch(`http://127.0.0.1:7000/studentanswer/${code}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 210) {
          // Redirect to the result page when quiz data is not found (status code: 404)
          const code = window.location.pathname.split('/')[2];
          const targetURL = `/quiz/${code}/feedback`;
          navigate(targetURL);
              }
        else if (response.ok) {
          const responseData = await response.json();
        console.log(responseData);
          setQuestionData(responseData.data.firstQuestion);
          setCurrentIndex(responseData.data.currentIndex); 
        } 
        else {
          console.error('Failed to fetch quiz details:', response.status);
        }
      } catch (error) {
        console.error('Error fetching quiz details:', error);
      }
    };
       
    fetchQuestionDetails();
  }, [navigate]);


 // Function to open the page in full screen
 const openFullScreen = () => {
  const docElem = document.documentElement;
  if (docElem.requestFullscreen) {
    docElem.requestFullscreen();
  } else if (docElem.mozRequestFullScreen) {
    docElem.mozRequestFullScreen();
  } else if (docElem.webkitRequestFullscreen) {
    docElem.webkitRequestFullscreen();
  } else if (docElem.msRequestFullscreen) {
    docElem.msRequestFullscreen();
  }
};

useEffect(() => {
  setSelectedOptions([]);
  setAnswer([]);
}, [questionData]);

  // Render a loading message while waiting for data
  if (!questionData) {
    return <div>Loading...</div>;
  }

  
// Custom comparison function to check if two arrays are equal
const areArraysEqual = (array1, array2) => {
  if (array1.length !== array2.length) return false;

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }

  return true;
};

const handleAnswerSelect = (option) => {
  // event.preventDefault(); // Prevent default behavior of the click event

  if (questionData.questionType === 'single') {
    setAnswer([option]); // Store the single option answer as an array with a single element
    setSelectedOptions([option]);
    setTimeElapsed(10);
  } else if (questionData.questionType === 'multiple') {
    setSelectedOptions((prevSelectedOptions) => {
      const isOptionSelected = prevSelectedOptions.some((selectedOption) => areArraysEqual(selectedOption, option));

      if (isOptionSelected) {
        return prevSelectedOptions.filter((selectedOption) => !areArraysEqual(selectedOption, option));
      } else {
        return [...prevSelectedOptions, option];
      }
    });

    setAnswer((prevAnswer) => {
      const isOptionSelected = prevAnswer.some((selectedOption) => areArraysEqual(selectedOption, option));

      if (isOptionSelected) {
        return prevAnswer.filter((selectedOption) => !areArraysEqual(selectedOption, option));
      } else {
        return [...prevAnswer, option];
      }
    });

    setTimeElapsed(10);
  }
};

    
  
const handleSubmit = async (event) => {
  event.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    const code = window.location.pathname.split('/')[2];

    const response = await fetch(`http://127.0.0.1:7000/studentanswer/${code}/${currentIndex}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answer, timeElapsed }),
    });
   
    if (response.ok) {
      // Successfully saved the selected option
      // Now navigate to the next question
      const responseData = await response.json();
      setQuestionData(responseData.data.nextQuestion); // Update the state with the next question's data
      setCurrentIndex(responseData.data.nextIndex); // Update the currentIndex state
      setAnswer([]); // Clear the selected answer for the next question
      
      // Scroll to the top of the page after the data is updated
      window.scrollTo(0, 0);
      
      // Log the updated questionData (Note: The state update might not be synchronous)
      console.log('Updated questionData:', responseData.data.nextQuestion);
    } else if (response.status === 410) {
      // Redirect to the result page when quiz data is not found (status code: 210)
      const targetURL = `/quiz/${code}/feedback`;
      navigate(targetURL); // Replace '/result' with the actual path of your result page
    } else {
      console.error('Failed to submit answer:', response.status);
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
  }
};

  

  return (
    <div>
      <div className="quizzing-box">
        <div className="quizzing-container" id="quiz">
          <div className="quizzing-wrapper">
            {/* <div className="quizzing-logo">
              <img src={logo} alt="logo" />
            </div> */}
            <br />
            <h1 id="subject" className="designh1"></h1>
          </div>

          <section id="nav">
            <div id="chance">
              <h5 className="whichtypeof">Relax Timer <span id="reltime">00:10</span></h5>
              <h5 className="whichtypeof1" align="left">Choose the Section :</h5>
            </div>

            <div id="quizzing-hide1">
              <div className="time maxwidth1 m_auto">
                <h2>Section Time Left : <span id="timeLeft">00:00</span></h2>
                <h2>Question Time Left : <span id="questionTimeLeft">{questionData.questionTime}</span></h2>
              </div>

              <div id="help" className="maxwidth1 m_auto t_auto">
                <span id="green">Attempted <span id="attempted"> 0 </span></span>
                &nbsp; <span id="red">Missed <span id="missed">0 </span></span> &nbsp; Left <span id="left"></span>
              </div>
            </div>
            
          </section>

          <div className="quizzing-hide">
            <div id="progressBar" className="m_auto">
              <div id="progressBarFull" className="colorbar"></div>
            </div>

            
            {questionData.questionType === 'single' && (
            <div id="singleCorrect" className="colorbar">
              <h2><span id="quizType">Objective Type Question</span></h2>
              <div className="quizzing-header">
                {/* Render the question content */}
                <CKEditorViewer editorData={questionData.question}/>
                {/* Render the options */}
                <div className='quizzing-options-box'>
                <ul id="list">
  {questionData.options.map((option) => (
    <li
      key={option}
      onClick={() => handleAnswerSelect(option)}
      className= {selectedOptions == option ? 'selected-option' : 'quizzing-option'}
    >
      <div>{option}</div>
    </li>
  ))}
</ul>            </div>
              </div>
            </div>
          )}


                      

{questionData.questionType === 'numerical' && (
            <div id="numerical">
              <h2><span id="quizType">Numerical Type Question</span></h2>
              <div className="quizzing-header">
                {/* Render the question content */}
                {/* Render the question content */}
                <CKEditorViewer editorData={questionData.question}/>
                {/* Render the options */}
                {/* Render the input field for numerical answer */}
                <form autoComplete="off" onKeyDown={(event) => event.key !== 'Enter'}>
                  <h3><input id="numericalAns" type="text" onChange={(e) => setAnswer(e.target.value)} /><br /></h3>
                </form>
              </div>
            </div>
          )}

{questionData.questionType === 'multiple' && (
  <div id="multiCorrect">
    <h2><span id="quizType">Multi Correct Question</span></h2>
    <div className="quizzing-header">
      {/* Render the question content */}
      <CKEditorViewer editorData={questionData.question} />
      {/* Render the options */}
      <ul id="listmul">
        {questionData.options.map((option) => (
          <li
            key={JSON.stringify(option)} // Ensure each option array has a unique key
            onClick={() => handleAnswerSelect(option)}
            className={selectedOptions.some((selectedOption) => areArraysEqual(selectedOption, option)) ? 'selected-option' : 'quizzing-option'}
          >
            <div>{option}</div>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}
               

          </div>
          <button id="quizzing-submit"  onClick={handleSubmit}>Next</button>

        </div>

        <form method="POST">
          <input type="hidden" />
          <textarea name="answer" className="quizzing-hide" id="ans" style={{ display: 'none' }}></textarea><br />
          <textarea name="questions" className="quizzing-hide" id="all_questions_in_string" style={{ display: 'none' }}></textarea>
          <input type="submit" className="quizzing-hide" style={{ display: 'none' }} id="quiz_submit_button" value="submit test" />
        </form>
      </div>
    </div>
  )
}

export default Quizzing