import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import AdminLayout from '@src/components/AdminLayout';
import Head from 'next/head';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { useRouter } from 'next/router';
import { Button, Table, Modal, Form, Input, InputNumber, Switch, Select, message, Popconfirm, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

// FAQ 인터페이스 정의
interface FAQ {
  id: number;
  tag: string;
  title: string;
  contents: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

// FAQ 태그 옵션
const TAG_OPTIONS = ['일반', '배송', '주문', '결제', '교환/환불', '기타'];
const { Title } = Typography;

const FAQsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchFaqs();
    fetchTags();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/faqs');
      const data = await response.json();
      
      // 표시 순서로 정렬
      const sortedData = data.sort((a: FAQ, b: FAQ) => a.display_order - b.display_order);
      setFaqs(sortedData);
    } catch (error) {
      console.error('FAQ 불러오기 실패:', error);
      message.error('FAQ를 불러오는 데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/faq-tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('태그 불러오기 실패:', error);
      message.error('태그를 불러오는 데 실패했습니다');
    }
  };

  const showAddModal = () => {
    setEditingFaq(null);
    form.resetFields();
    // 기본값 설정
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(faq => faq.display_order)) : 0;
    form.setFieldsValue({
      display_order: maxOrder + 1,
      is_visible: true
    });
    setModalVisible(true);
  };

  const showEditModal = (record: FAQ) => {
    setEditingFaq(record);
    form.setFieldsValue({
      tag: record.tag,
      title: record.title,
      contents: record.contents,
      display_order: record.display_order,
      is_visible: record.is_visible
    });
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingFaq) {
        // FAQ 수정
        const response = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (response.ok) {
          message.success('FAQ가 수정되었습니다');
          fetchFaqs();
        } else {
          throw new Error('FAQ 수정 실패');
        }
      } else {
        // 새 FAQ 추가
        const response = await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (response.ok) {
          message.success('새 FAQ가 추가되었습니다');
          fetchFaqs();
        } else {
          throw new Error('FAQ 추가 실패');
        }
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('제출 오류:', error);
      message.error('제출 중 오류가 발생했습니다');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        message.success('FAQ가 삭제되었습니다');
        fetchFaqs();
      } else {
        throw new Error('FAQ 삭제 실패');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      message.error('삭제 중 오류가 발생했습니다');
    }
  };

  const handleMoveUp = async (record: FAQ) => {
    const currentIndex = faqs.findIndex(f => f.id === record.id);
    if (currentIndex <= 0) return;
    
    const prevFaq = faqs[currentIndex - 1];
    
    try {
      // 교환할 두 FAQ의 표시 순서를 교환
      await Promise.all([
        fetch(`/api/admin/faqs/${record.id}/order`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: prevFaq.display_order }),
        }),
        fetch(`/api/admin/faqs/${prevFaq.id}/order`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: record.display_order }),
        })
      ]);
      
      message.success('순서가 변경되었습니다');
      fetchFaqs();
    } catch (error) {
      console.error('순서 변경 오류:', error);
      message.error('순서 변경 중 오류가 발생했습니다');
    }
  };

  const handleMoveDown = async (record: FAQ) => {
    const currentIndex = faqs.findIndex(f => f.id === record.id);
    if (currentIndex >= faqs.length - 1) return;
    
    const nextFaq = faqs[currentIndex + 1];
    
    try {
      // 교환할 두 FAQ의 표시 순서를 교환
      await Promise.all([
        fetch(`/api/admin/faqs/${record.id}/order`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: nextFaq.display_order }),
        }),
        fetch(`/api/admin/faqs/${nextFaq.id}/order`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: record.display_order }),
        })
      ]);
      
      message.success('순서가 변경되었습니다');
      fetchFaqs();
    } catch (error) {
      console.error('순서 변경 오류:', error);
      message.error('순서 변경 중 오류가 발생했습니다');
    }
  };

  const handleVisibilityChange = async (id: number, value: boolean) => {
    try {
      const response = await fetch(`/api/admin/faqs/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: value }),
      });
      
      if (response.ok) {
        message.success(`FAQ가 ${value ? '표시' : '숨김'} 처리되었습니다`);
        fetchFaqs();
      } else {
        throw new Error('표시 상태 변경 실패');
      }
    } catch (error) {
      console.error('표시 상태 변경 오류:', error);
      message.error('표시 상태 변경 중 오류가 발생했습니다');
    }
  };

  const columns = [
    {
      title: '순서',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 80,
    },
    {
      title: '태그',
      dataIndex: 'tag',
      key: 'tag',
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>,
    },
    {
      title: '내용',
      dataIndex: 'contents',
      key: 'contents',
      render: (text: string) => <div style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>,
    },
    {
      title: '표시 여부',
      dataIndex: 'is_visible',
      key: 'is_visible',
      render: (visible: boolean, record: FAQ) => (
        <Switch
          checked={visible}
          onChange={(checked: boolean) => handleVisibilityChange(record.id, checked)}
        />
      ),
    },
    {
      title: '생성일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString('ko-KR'),
    },
    {
      title: '관리',
      key: 'action',
      render: (_: any, record: FAQ) => (
        <Space>
          <Button
            icon={<UpOutlined />}
            onClick={() => handleMoveUp(record)}
            size="small"
            disabled={faqs.indexOf(record) === 0}
          />
          <Button
            icon={<DownOutlined />}
            onClick={() => handleMoveDown(record)}
            size="small"
            disabled={faqs.indexOf(record) === faqs.length - 1}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            type="primary"
            size="small"
          />
          <Popconfirm
            title="이 FAQ를 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.id)}
            okText="예"
            cancelText="아니오"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>FAQ 관리 | 허브 커뮤니티</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <AdminLayout title="FAQ 관리">
        <Container>
          <Header>
            <Title level={2}>FAQ 관리</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              FAQ 추가
            </Button>
          </Header>

          <Table
            columns={columns}
            dataSource={faqs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />

          <Modal
            title={editingFaq ? 'FAQ 수정' : '새 FAQ 추가'}
            open={modalVisible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            okText={editingFaq ? '수정' : '추가'}
            cancelText="취소"
            width={800}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="tag"
                label="태그"
                rules={[{ required: true, message: '태그를 입력해주세요' }]}
              >
                {tags.length > 0 ? (
                  <Select>
                    {tags.map(tag => (
                      <Select.Option key={tag} value={tag}>{tag}</Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Input placeholder="새 태그 입력" />
                )}
              </Form.Item>
              <Form.Item
                name="title"
                label="제목"
                rules={[{ required: true, message: '제목을 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="contents"
                label="내용"
                rules={[{ required: true, message: '내용을 입력해주세요' }]}
              >
                <Input.TextArea rows={6} />
              </Form.Item>
              <Form.Item
                name="display_order"
                label="표시 순서"
                rules={[{ required: true, message: '표시 순서를 입력해주세요' }]}
              >
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item
                name="is_visible"
                label="표시 여부"
                valuePropName="checked"
              >
                <Switch />
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

export default FAQsPage; 