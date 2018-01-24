import React from 'react'
import PropTypes from 'prop-types'
import {
  ListGroup,
  ListGroupItem,
} from 'reactstrap'
import { connect } from 'react-redux'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'

import Question from './Question'

const QuestionList = (props) => {
  let questions
  if (props.queue && props.queue.questions) {
    if (props.queue.questions.length > 0) {
      questions = props.queue.questions.map((questionId) => {
        const question = props.questions[questionId]
        return (
          <Question
            onDeleteQuestion={props.deleteQuestion}
            key={questionId}
            {...question}
          />
        )
      })
    } else {
      questions = (
        <ListGroupItem className="text-center text-muted pt-4 pb-4">
          The queue is empty!
        </ListGroupItem>
      )
    }
  } else {
    questions = (
      <ListGroupItem className="text-center pt-4 pb-4">
        <FontAwesomeIcon icon={faSpinner} pulse />
      </ListGroupItem>
    )
  }

  return (
    <div>
      <ListGroup className="mt-3">
        {questions}
      </ListGroup>
    </div>
  )
}

QuestionList.propTypes = {
  queue: PropTypes.shape({
    questions: PropTypes.arrayOf(PropTypes.number),
  }),
  questions: PropTypes.objectOf(PropTypes.shape({
    name: PropTypes.string,
    location: PropTypes.string,
    topic: PropTypes.string,
  })),
  deleteQuestion: PropTypes.func.isRequired,
}

QuestionList.defaultProps = {
  queue: null,
  questions: null,
}

const mapStateToProps = (state, { queueId }) => ({
  queue: state.queues.queues[queueId],
  questions: state.questions.questions,
})

export default connect(mapStateToProps)(QuestionList)