import { Button, Typography, Space, Flex, Radio } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const { Title, Paragraph } = Typography

export function ReceptionPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <Flex justify="center" align="center" vertical style={{ minHeight: '100vh', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 24, right: 24 }}>
        <Radio.Group value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
          <Radio.Button value="pt">PT</Radio.Button>
          <Radio.Button value="en">EN</Radio.Button>
          <Radio.Button value="fr">FR</Radio.Button>
        </Radio.Group>
      </div>
      <Space direction="vertical" size="large">
        <Typography>
          <Title>{t('reception.welcomeMessage')}</Title>
          <Paragraph>{t('reception.instructions')}</Paragraph>
        </Typography>
        <Button type="primary" size="large" onClick={() => navigate('/login')}>
          {t('reception.accessButton')}
        </Button>
      </Space>
    </Flex>
  )
}
