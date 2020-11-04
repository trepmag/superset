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
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { t, buildQueryContext } from '@superset-ui/core';

import CopyToClipboard from 'src/components/CopyToClipboard';

import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/light';
import jsSyntax from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import github from 'react-syntax-highlighter/dist/cjs/styles/hljs/github';

SyntaxHighlighter.registerLanguage('js', jsSyntax);

const propTypes = {
  latestQueryFormData: PropTypes.object.isRequired,
};

export default class DisplayApiButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      queryContext: {}
    }
    this.onEnter = this.onEnter.bind(this);
  }

  onEnter() {
    const queryContext = buildQueryContext(this.props.latestQueryFormData, baseQueryObject => [
      {
        ...baseQueryObject,
      },
    ]);
    console.log('QC', queryContext);
    this.setState({ queryContext: queryContext });
  }

  buildInstructionCurl() {
    const basePath = window.location.origin;
    const queryContextString = JSON.stringify(this.state.queryContext).replace(/\"/g, '\\"');
    console.log('aaaaaaa', queryContextString);
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

  renderPopover() {
    const instructionCurl = this.buildInstructionCurl();
    const instructionJs = this.buildInstructionJs();
    console.log('renderPopover', github);
    let styleJs = {
      ...github,
      hljs: {
        maxHeight: 300
      }
    };
    // styleJs.hljs.maxHeight = 300;
    // console.log(styleJs);
    return (
      <Popover id="display-api-popover">
        <h3>API /chart/data</h3>
        <div>
          <div className="row">
            <h4 className="col-sm-12">Curl</h4>
          </div>
          <div className="row">
            <div className="col-sm-10">
              <pre>
                {instructionCurl}
              </pre>
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
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="left"
        onEnter={() => this.onEnter()}
        overlay={this.renderPopover()}
      >
        <span className="btn btn-default btn-sm" data-test="display-api-button">
          <i className="fa fa-server" /> API
          &nbsp;
        </span>
      </OverlayTrigger>
    );
  }

}

DisplayApiButton.propTypes = propTypes;
