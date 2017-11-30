import { h, render } from 'preact-cycle';

import createChannelHandler from './createChannelHandler';

const ISSUES_CHANNEL_NAME = 'issues';

const ISSUES_CHANNEL =
  createChannelHandler(
    ISSUES_CHANNEL_NAME,
    PROCESS_ISSUE_MESSAGE,
    (partner, channel) =>
      ({
        partner,
        channel,
        issues: [],
        messages: [],
        input: {
          message: undefined
        }
      }));

const {
  PROCESS_ISSUE_MESSAGE,
  NEW_ISSUE,
  ADD_ISSUE,
  ISSUES_MESSAGE_INPUT,
  SHOW_ISSUE
} = {
  PROCESS_ISSUE_MESSAGE: (_, issue, type, {data}) => {
    ADD_ISSUE(_, issue, 'partner', JSON.parse(data));
  },

  NEW_ISSUE: (_, issues) => {
    const {message} = issues.input,
          data = {time: new Date().getTime(), message, creator: _.signaler.currentId.toString()};

    ADD_ISSUE(_, issues, 'self', data);

    issues.channel.send(JSON.stringify(data));
    issues.input.message = '';
  },

  ADD_ISSUE: (_, issues, type, data) => {
    const issue = {id: issues.issues.length + 1, messages: [data]};

    issues.messages.push(issue);
    issues.issues.push(issue);

    SHOW_ISSUE(_, issues, issue);
  },

  ISSUES_MESSAGE_INPUT: (_, issues, {target: {value}}) => {
    issues.input.message = value;
  },

  SHOW_ISSUE: (_, issues, issue) => {
    issues.issueDetail = issue;
  }
};

// jshint ignore:start
const Issues = ({issues}, {mutation}) => (
  <issues>
    <div>Issues</div>
    <issue-list>
      {issues.issues.map(issue => <issue-id onClick={mutation(SHOW_ISSUE, issues, issue)} className={{'shown': issue === issues.issueDetail}}>{issue.id}</issue-id>)}
    </issue-list>
    <issue-detail>
      {issues.issueDetail ? <Issue issue={issues.issueDetail} /> : undefined}
    </issue-detail>
    <issue-input>
      <form onSubmit={mutation(NEW_ISSUE, issues)} action="javascript:" autoFocus>
        <input type="text" value={issues.input.message} onInput={mutation(ISSUES_MESSAGE_INPUT, issues)} placeholder="Type your issue here..." />
        <button>New Issue</button>
      </form>
    </issue-input>
  </issues>
);
// jshint ignore:end

// jshint ignore:start
const Issue = ({issue: {id, messages}}) => (
  <issue>
    <messages>
      {messages.map(({message}) => (
        <message>
          {message}
        </message>
      ))}
    </messages>
  </issue>
);
// jshint ignore:end


export {Issues, ISSUES_CHANNEL, ISSUES_CHANNEL_NAME};