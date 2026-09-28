import { Form, Input, Modal, message } from 'antd';
import { useCreateWorkItemMutation } from '../hooks/useWorkItems';
import { CreateWorkItemInput } from '../types/work-item.types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkItemModal({ open, onClose }: Props) {
  const [form] = Form.useForm<CreateWorkItemInput>();
  const createWorkItem = useCreateWorkItemMutation();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await createWorkItem.mutateAsync(values);
      message.success('Work item created.');
      form.resetFields();
      onClose();
    } catch (error: any) {
      if (error?.errorFields) return; // antd form validation error, already shown inline
      const description = error?.response?.data?.message ?? error.message ?? 'Failed to create work item';
      message.error(Array.isArray(description) ? description.join(', ') : String(description));
    }
  };

  return (
    <Modal
      title="New work item"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={createWorkItem.isPending}
      okText="Create"
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item name="externalId" label="External ID" rules={[{ required: true }]}>
          <Input placeholder="e.g. CRM-1042" />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Short summary of the request" />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Full details for the AI analysis" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
