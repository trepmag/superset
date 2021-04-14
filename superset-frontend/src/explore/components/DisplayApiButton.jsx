/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'src/components/Popover';
import { OverlayTrigger } from 'react-bootstrap';
import { t, buildQueryContext } from '@superset-ui/core';

import CopyToClipboard from 'src/components/CopyToClipboard';

import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/light';
import jsSyntax from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import shSyntax from 'react-syntax-highlighter/dist/cjs/languages/hljs/shell';
import github from 'react-syntax-highlighter/dist/cjs/styles/hljs/github';

SyntaxHighlighter.registerLanguage('js', jsSyntax);
SyntaxHighlighter.registerLanguage('sh', shSyntax);

const propTypes = {
  latestQueryFormData: PropTypes.object.isRequired,
};

export default class DisplayApiButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      queryContext: {}
    }
    this.updateQueryContext = this.updateQueryContext.bind(this);
  }

  updateQueryContext() {
    const queryContext = buildQueryContext(this.props.latestQueryFormData, baseQueryObject => [
      {
        ...baseQueryObject,
      },
    ]);
    this.setState({ queryContext: queryContext });
  }

  buildInstructionCurl() {
    const basePath = window.location.origin;
    const queryContextString = JSON.stringify(this.state.queryContext).replace(/\"/g, '\\"');
    return `curl -X POST "${basePath}/api/v1/chart/data" -H "accept: application/json" -H  "Content-Type: application/json" -d "${queryContextString}"`
  }

  buildInstructionJs() {
    const basePath = window.location.origin;
    const queryContextString = JSON.stringify(this.state.queryContext, null, 2).replace(/"([^"]+)"\:/g, '$1: ');
    return `const queryContext = ${queryContextString};

fetch('${basePath}/api/v1/chart/data', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(queryContext)
})
.then(response => response.json())
.then(json => console.log(json));`
  }

  renderPopoverContent() {
    const instructionCurl = this.buildInstructionCurl();
    const instructionJs = this.buildInstructionJs();
    const styleSh = {
      ...github,
      hljs: {
        maxWidth: 500,
      }
    };
    const styleJs = {
      ...github,
      hljs: {
        maxWidth: 500,
        maxHeight: 300,
      }
    };
    return (
      <div id="display-api-popover" data-test="display-api-popover">
        <h3>API /chart/data</h3>
        <div>
          <div className="row">
            <h4 className="col-sm-12">Curl</h4>
          </div>
          <div className="row">
            <div className="col-sm-10">
              <SyntaxHighlighter language="sh" style={styleSh}>
                {instructionCurl}
              </SyntaxHighlighter>
            </div>
            <div className="col-sm-2">
              <CopyToClipboard
                shouldShowText={false}
                text={instructionCurl}
                copyNode={
                  <i
                    className="fa fa-clipboard"
                    title={t('Copy to clipboard')}
                  />
                }
              />
            </div>
          </div>
          <div className="row">
            <h4 className="col-sm-12">Javascript</h4>
          </div>
          <div className="row">
            <div className="col-sm-10">
              <SyntaxHighlighter language="js" style={styleJs}>
                {instructionJs}
              </SyntaxHighlighter>
            </div>
            <div className="col-sm-2">
              <CopyToClipboard
                shouldShowText={false}
                text={instructionJs}
                copyNode={
                  <i
                    className="fa fa-clipboard"
                    title={t('Copy to clipboard')}
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Popover
        trigger="click"
        // rootClose
        placement="left"
        onClick={() => this.updateQueryContext()}
        content={this.renderPopoverContent()}
      >
        <span className="btn btn-default btn-sm" data-test="display-api-button">
          <i className="fa fa-server" /> API
          &nbsp;
        </span>
      </Popover>
    );
  }

}

DisplayApiButton.propTypes = propTypes;
