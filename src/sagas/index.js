import { takeLatest, put, spawn, debounce, retry, cancel, fork } from 'redux-saga/effects';
import { searchSkillsRequest, searchSkillsSuccess, searchSkillsFailure, resetSkills } from '../actions/actionCreators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST } from '../actions/actionTypes';
import { searchSkills } from '../api/index';

function filterChangeSearchAction({ type }) {
  return type === CHANGE_SEARCH_FIELD;
}

// worker
function* handleChangeSearchSaga(action) {
  yield put(searchSkillsRequest(action.payload.search));
}

// watcher
function* watchChangeSearchSaga() {
  yield debounce(100, filterChangeSearchAction, handleChangeSearchSaga);
}

// worker
function* handleSearchSkillsSaga(action) {
  try {
    const retryCount = 3;
    const retryDelay = 1 * 1000;
    const data = yield retry(retryCount, retryDelay, searchSkills, action.payload.search);
    yield put(searchSkillsSuccess(data));
  } catch (e) {
    yield put(searchSkillsFailure(e.message));
  }
}

function* handleSearchSkillsRequest(action) {
  let task = null;

  if (action.payload.search.trim() === '') {
    if (task) {
      yield cancel(task);
    }

    yield put(resetSkills());
  } else {
    task = yield fork(handleSearchSkillsSaga, action);
  }
}

// watcher
function* watchSearchSkillsSaga() {
  yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsRequest);
}

export default function* saga() {
  yield spawn(watchChangeSearchSaga);
  yield spawn(watchSearchSkillsSaga);
}
