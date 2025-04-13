import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Space, Typography, Radio } from 'antd';
import { CloseOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styled from '@emotion/styled';
import AdminLayout from '@src/components/AdminLayout';
import Head from 'next/head';
import axios from 'axios';
import { useRouter } from 'next/router';

// 스케줄 인터페이스 정의
interface Schedule {
  id: number;
  title: string;
  end_time: string;
  day: string;
  mainvisible: number;
  created_at: string;
}

const { Title } = Typography;
const { Option } = Select;

const AdminSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      message.error('스케줄 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const showModal = (record?: Schedule) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        title: record.title,
        end_time: record.end_time,
        day: record.day,
        mainvisible: record.mainvisible,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingId) {
        // 수정 요청
        await axios.put(`/api/admin/schedules/${editingId}`, values);
        message.success('스케줄이 성공적으로 수정되었습니다.');
        fetchSchedules();
      } else {
        // 추가 요청
        await axios.post('/api/admin/schedules', values);
        message.success('스케줄이 성공적으로 추가되었습니다.');
        fetchSchedules();
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/schedules/${id}`);
      message.success('스케줄이 삭제되었습니다');
      fetchSchedules();
    } catch (error) {
      console.error('스케줄 삭제 중 오류:', error);
      message.error('스케줄 삭제 중 오류가 발생했습니다');
    }
  };

  const handleMainVisibleChange = async (id: number, value: number) => {
    try {
      await axios.patch(`/api/admin/schedules/${id}/mainvisible`, { mainvisible: value });
      message.success('메인 노출 설정이 변경되었습니다.');
      fetchSchedules();
    } catch (error) {
      console.error('Failed to update mainvisible:', error);
      message.error('메인 노출 설정 변경에 실패했습니다.');
    }
  };

  const columns: ColumnsType<Schedule> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '종료 시간',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: '요일',
      dataIndex: 'day',
      key: 'day',
    },
    {
      title: '메인 노출',
      dataIndex: 'mainvisible',
      key: 'mainvisible',
      render: (mainvisible: number, record: Schedule) => (
        <Radio.Group
          value={mainvisible}
          onChange={(e) => handleMainVisibleChange(record.id, e.target.value)}
        >
          <Radio value={1}>1</Radio>
          <Radio value={2}>2</Radio>
          <Radio value={3}>3</Radio>
        </Radio.Group>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '작업',
      key: 'action',
      width: 150,
      render: (_: any, record: Schedule) => (
        <Space size="middle">
          <ActionButton onClick={() => showModal(record)}>
            <EditOutlined /> 수정
          </ActionButton>
          <ActionButton danger onClick={() => handleDelete(record.id)}>
            <CloseOutlined /> 삭제
          </ActionButton>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>스케줄 관리 | 허브 커뮤니티</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <AdminLayout title="스케줄 관리">
        <Container>
          <Header>
            <Title level={2}>스케줄 관리</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              스케줄 추가
            </Button>
          </Header>

          <Table
            columns={columns}
            dataSource={schedules}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />

          <Modal
            title={editingId ? '스케줄 수정' : '스케줄 추가'}
            open={isModalVisible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={editingId ? '수정' : '추가'}
            cancelText="취소"
          >
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="title"
                label="제목"
                rules={[{ required: true, message: '제목을 입력해주세요' }]}
              >
                <Input placeholder="스케줄 제목 입력" />
              </Form.Item>
              
              <Form.Item
                name="end_time"
                label="종료 시간"
                rules={[{ required: true, message: '종료 시간을 입력해주세요' }]}
              >
                <Input placeholder="예: 18:00" />
              </Form.Item>
              
              <Form.Item
                name="day"
                label="요일"
                rules={[{ required: true, message: '요일을 입력해주세요' }]}
              >
                <Select placeholder="요일 선택">
                  <Option value="월">월요일</Option>
                  <Option value="화">화요일</Option>
                  <Option value="수">수요일</Option>
                  <Option value="목">목요일</Option>
                  <Option value="금">금요일</Option>
                  <Option value="토">토요일</Option>
                  <Option value="일">일요일</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="mainvisible"
                label="메인 노출"
                initialValue={3}
              >
                <Radio.Group>
                  <Radio value={1}>1</Radio>
                  <Radio value={2}>2</Radio>
                  <Radio value={3}>3</Radio>
                </Radio.Group>
              </Form.Item>
            </Form>
          </Modal>
        </Container>
      </AdminLayout>
    </>
  );
};

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ActionButton = styled(Button)`
  padding: 0 8px;
  height: 24px;
  font-size: 12px;
`;

export default AdminSchedulesPage; 