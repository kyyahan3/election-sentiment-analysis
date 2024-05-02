// Authorship: Yahan

import { Tag, Row, Col, Card } from 'antd';
import { rgba } from './utils/colors';
import {BASE_PARTY_COLORS} from './utils/constants';

const Legend = () => {
    const tagStyle = {
        padding: '5px 10px', // Adjust padding to make tag higher
        fontSize: '16px', 
        // fontWeight: 'bold',
        borderRadius: '4px', // rounded corners
        };

    return (
    <Card title="Legend" align="middle" style={{ textAlign: 'center', height: '230px'}}>
        <Row justify="center" style={{ marginBottom: '20px', marginTop: '15px' }}>
            <Col>
            <Tag style={tagStyle} color={rgba(BASE_PARTY_COLORS.democrat, 0.8)}>Democrat</Tag>
            </Col>
            <Col>
            <Tag style={tagStyle} color={rgba(BASE_PARTY_COLORS.green, 0.9)}>Green</Tag>
            </Col>
        </Row>
        <Row justify="center">
            <Col>
            <Tag style={tagStyle} color={rgba(BASE_PARTY_COLORS.republican, 0.8)}>Republican</Tag>
            </Col>
            <Col>
            <Tag style={tagStyle} color={rgba(BASE_PARTY_COLORS.libertarian, 0.8)}>Libertarian</Tag>
            </Col>
        </Row>
    </Card>
    );
};
export default Legend;
