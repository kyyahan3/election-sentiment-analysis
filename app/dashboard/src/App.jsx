// Authorship: Yahan

import React from 'react'
import { Layout, Row, Col } from 'antd'
import './App.css'
import RealTimeEmotionBar from './RealTimeBarEmotion'
import RadarChartEmotion from './RadarChartEmotion'
import DoughnutPosts from './DoughnutPosts'
import TSPlotSentiment from './TSPlotSentiment'
import Legend from './Legend'
import RedditLogo from './RedditLogo'
import ChartVenn from './VennUserCount'

const { Content, Header } = Layout;
const headerStyle = {
    textAlign: 'center',
    color: '#fff',
    height: 60,
    paddingInline: 48,
    lineHeight: '64px',
    backgroundColor: '#4096ff',
    fontSize: '22px',
  };

function App () {
  return (
    <Layout>
        <Header style={headerStyle}>Reddit Sentiment Analysis of U.S. 2024 Presidential Elections</Header>
        <Content style={{ margin: '20px 20px 180px' }}> 
            <Row gutter={40} style={{ margin: '20px', height: '250px' }}>
                <Col span={5}><Legend /></Col>
                <Col span={5}><DoughnutPosts /></Col>
                <Col span={10}><ChartVenn /></Col>
                <Col span={4}><RedditLogo /></Col>
            </Row>
            <Row gutter={40} style={{ margin: '20px' }}>
                <Col span={16} ><RealTimeEmotionBar /></Col>
                <Col span={8} ><RadarChartEmotion /></Col>
            </Row>
            <Row gutter={40} style={{ margin: '20px' }}>
                <Col span={24}><TSPlotSentiment /></Col>
            </Row>
        </Content>
    </Layout>
  )
}

export default App