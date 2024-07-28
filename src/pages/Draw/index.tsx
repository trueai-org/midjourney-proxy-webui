import { cancelTask, queryTask, queryTaskByIds, submitTask, swapFace } from '@/services/mj/api';
import { ClearOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { RadioChangeEvent } from 'antd';
import {
  Avatar,
  Button,
  Card,
  Flex,
  Image as AntdImage,
  Input,
  message,
  Modal,
  notification,
  Progress,
  Radio,
  Select,
  Space,
  Spin,
  Tag,
  Upload,
} from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import styles from './index.less';

const { TextArea } = Input;
const { Meta } = Card;

const Draw: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const [tasks, setTasks] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [action, setAction] = useState('imagine');
  const [botType, setBotType] = useState('MID_JOURNEY');
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState('SQUARE');
  const [images, setImages] = useState<UploadFile[]>([]);

  const [loadingButton, setLoadingButton] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [waitTaskIds] = useState(new Set<string>());

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customTaskId, setCustomTaskId] = useState<string>('');
  const [modalImage, setModalImage] = useState<string>('');
  const [modalImageHeight, setModalImageHeight] = useState<number>(0);
  const [modalRemix, setModalRemix] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const intl = useIntl();

  const cbSaver = useRef<any[]>([]);
  const syncRunningTasksFutureRef = useRef<NodeJS.Timeout | null>(null);

  const customState = 'midjourney-proxy-admin';
  const imagePrefix = sessionStorage.getItem('mj-image-prefix') || '';

  useEffect(() => {
    fetchData({
      state: customState,
      pageNumber: 0,
      pageSize: 3,
      statusSet: ['NOT_START', 'SUBMITTED', 'IN_PROGRESS', 'FAILURE', 'SUCCESS'],
      sort: 'submitTime,desc',
    });

    if (syncRunningTasksFutureRef.current) {
      clearInterval(syncRunningTasksFutureRef.current);
    }

    syncRunningTasksFutureRef.current = setInterval(() => {
      if (waitTaskIds.size === 0) return;
      syncRunningTasks();
    }, 2000);

    return () => {
      if (syncRunningTasksFutureRef.current) {
        clearInterval(syncRunningTasksFutureRef.current);
        syncRunningTasksFutureRef.current = null;
      }
    };
  }, []);

  const syncRunningTasks = async () => {
    const taskIds = Array.from(waitTaskIds);
    const tmpTaskIds = new Set(taskIds);
    const array = await queryTaskByIds(taskIds);
    let hasChange = false;
    const targetTasks = [...cbSaver.current];
    for (const item of array) {
      tmpTaskIds.delete(item.id);
      if (item.status === 'FAILURE' || item.status === 'SUCCESS' || item.status === 'CANCEL') {
        waitTaskIds.delete(item.id);
      }
      const task = targetTasks.find((element) => element.id === item.id);
      if (!task) {
        hasChange = true;
        targetTasks.push(item);
      } else if (!isSameTask(task, item)) {
        hasChange = true;
        targetTasks.splice(targetTasks.indexOf(task), 1, item);
      }
    }
    for (const needRemoveId of tmpTaskIds) {
      waitTaskIds.delete(needRemoveId);
    }
    if (hasChange) {
      cbSaver.current = targetTasks;
      setTasks(targetTasks);
      scrollToBottom();
    }
  };

  const isSameTask = (old: any, task: any) => {
    return (
      old.status === task.status && old.progress === task.progress && old.imageUrl === task.imageUrl
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const panel = document.getElementById('task-panel');
      if (!panel) return;
      panel.scrollTo(0, panel.scrollHeight);
    }, 20);
  };

  const fetchData = async (params: any) => {
    setDataLoading(true);
    const res = await queryTask(params);
    const array = res.list.reverse();
    for (const item of array) {
      if (item.status !== 'FAILURE' && item.status !== 'SUCCESS' && item.action !== 'CANCEL') {
        waitTaskIds.add(item.id);
      }
    }
    cbSaver.current = array;
    setTasks(array);
    setDataLoading(false);
    scrollToBottom();
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    setPrompt('');
    setImages([]);
  };

  const handleBotTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setBotType(value);
    setPrompt('');
    setImages([]);
  };

  const handleDimensionsChange = ({ target: { value } }: RadioChangeEvent) => {
    setDimensions(value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleCustomPromptChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCustomPrompt(e.target.value);
  };

  const readFileAsBase64 = async (file: any) => {
    return await new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
    });
  };

  const submit = async () => {
    if (botType === 'INSIGHT_FACE') {
      if (images.length < 2) {
        message.error(intl.formatMessage({ id: 'pages.draw.swapTip' }));
        return;
      }
      setSubmitLoading(true);
      const sourceBase64 = await readFileAsBase64(images[0].originFileObj);
      const targetBase64 = await readFileAsBase64(images[1].originFileObj);
      swapFace({ sourceBase64, targetBase64, state: customState }).then((res) => {
        setSubmitLoading(false);
        if (res.code === 1) {
          message.success(intl.formatMessage({ id: 'pages.draw.submitSuccess' }));
          waitTaskIds.add(res.result);
          setImages([]);
        } else {
          api.error({
            message: 'error',
            description: res.description,
          });
        }
      });
    } else if (action === 'show') {
      if (!prompt) {
        message.error(intl.formatMessage({ id: 'pages.draw.taskIdNotBlank' }));
        return;
      }
      waitTaskIds.add(prompt);
      setPrompt('');
    } else if (action === 'imagine') {
      if (!prompt) {
        message.error(intl.formatMessage({ id: 'pages.draw.promptNotBlank' }));
        return;
      }
      setSubmitLoading(true);
      const base64Array = [];
      for (const item of images) {
        const base64 = await readFileAsBase64(item.originFileObj);
        base64Array.push(base64);
      }
      submitTask(action, {
        botType,
        prompt,
        base64Array,
        state: customState,
      }).then((res) => {
        setSubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setPrompt('');
          setImages([]);
        }
      });
    } else if (action === 'blend') {
      if (images.length < 2) {
        message.error(intl.formatMessage({ id: 'pages.draw.blendTip' }));
        return;
      }
      setSubmitLoading(true);
      const base64Array = [];
      for (const item of images) {
        const base64 = await readFileAsBase64(item.originFileObj);
        base64Array.push(base64);
      }
      submitTask(action, {
        botType,
        base64Array,
        dimensions,
        state: customState,
      }).then((res) => {
        setSubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setImages([]);
        }
      });
    } else if (action === 'describe') {
      if (images.length < 1) {
        message.error(intl.formatMessage({ id: 'pages.draw.imageEmptyTip' }));
        return;
      }
      setSubmitLoading(true);
      const base64 = await readFileAsBase64(images[0].originFileObj);
      submitTask(action, { botType, base64, state: customState }).then((res) => {
        setSubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setImages([]);
        }
      });
    } else if (action === 'shorten') {
      if (!prompt) {
        message.error(intl.formatMessage({ id: 'pages.draw.promptNotBlank' }));
        return;
      }
      setSubmitLoading(true);
      submitTask(action, { botType, prompt, state: customState }).then((res) => {
        setSubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setPrompt('');
        }
      });
    } else {
      message.error(intl.formatMessage({ id: 'pages.draw.unsupportedAction' }));
    }
  };

  const submitResultCheck = (res: any) => {
    if (res.code === 22 || res.code === 1) {
      if (res.code === 22) {
        api.warning({
          message: 'warn',
          description: res.description,
        });
      } else {
        message.success(intl.formatMessage({ id: 'pages.draw.submitSuccess' }));
      }
      return true;
    } else {
      api.error({
        message: 'error',
        description: res.description,
      });
      return false;
    }
  };

  const actionTask = (task: any, button: any) => {
    const customId = button.customId;
    const taskId = task.id;
    const label = `${button.emoji} ${button.label}`;
    setLoadingButton(`${taskId}:${customId}`);
    submitTask('action', {
      taskId,
      customId,
      state: customState,
      chooseSameChannel: true,
    }).then((res) => {
      setLoadingButton('');
      if (res.code === 22) {
        api.warning({
          message: 'warn',
          description: res.description,
        });
        button.style = 3;
        waitTaskIds.add(res.result);
      } else if (res.code === 21) {
        button.style = 3;
        setModalTitle(`${res.result} ${label}`);
        setCustomTaskId(res.result);
        setCustomPrompt(res.properties['finalPrompt']);
        setModalRemix(res.properties['remix'] || false);
        if (customId.startsWith('MJ::Inpaint:')) {
          const imgUrl = `${imagePrefix}${task.imageUrl}`;
          const img = new Image();
          img.src = imgUrl;
          img.onload = function () {
            setModalImageHeight(Math.floor((550 / img.width) * img.height));
            setModalImage(imgUrl);
            setModalVisible(true);
            setTimeout(() => {
              initCanvas();
            }, 300);
          };
        } else {
          setModalImage('');
          setModalVisible(true);
        }
        setModalVisible(true);
      } else if (res.code === 1) {
        button.style = 3;

        if (res.result) {
          // 如果是多个任务，以 ',' 分割
          const taskIds = res.result.split(',');
          taskIds.forEach((taskId: string) => {
            waitTaskIds.add(taskId);
          });

          // waitTaskIds.add(res.result);
        }
        message.success(intl.formatMessage({ id: 'pages.draw.actionSuccess' }));
      } else {
        api.error({
          message: 'error',
          description: res.description,
        });
      }
    });
  };

  let draw = false;
  let startX = 0;
  let startY = 0;

  const initCanvas = () => {
    const canvas: any = document.getElementById('canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const rect = canvas.getBoundingClientRect();
    const rectLeft = Math.floor(rect.left);
    const rectTop = Math.floor(rect.top);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    canvas.onmousedown = (e: any) => {
      startX = e.clientX;
      startY = e.clientY;
      draw = true;
    };
    canvas.onmousemove = (e: any) => {
      if (draw === true) {
        ctx.fillRect(startX - rectLeft, startY - rectTop, e.clientX - startX, e.clientY - startY);
      }
    };
    canvas.onmouseup = () => {
      draw = false;
    };
  };

  const cancelModal = () => {
    cancelTask(customTaskId);
    setModalVisible(false);
  };

  const submitModal = async () => {
    let params;
    setLoadingModal(true);
    if (modalImage) {
      const canvas: any = document.getElementById('canvas');
      const newImg = new Image();
      newImg.src = canvas.toDataURL('image/png');
      const base64 = await getMaskBase64(newImg);
      params = { maskBase64: base64, taskId: customTaskId, prompt: customPrompt };
    } else {
      params = { taskId: customTaskId, prompt: customPrompt };
    }
    submitTask('modal', params).then((res) => {
      setLoadingModal(false);
      if (res.code === 22) {
        api.warning({
          message: 'warn',
          description: res.description,
        });
        waitTaskIds.add(res.result);
        setModalVisible(false);
      } else if (res.code === 1) {
        waitTaskIds.add(res.result);
        setModalVisible(false);
        message.success(intl.formatMessage({ id: 'pages.draw.subSuccess' }));
      } else {
        api.error({
          message: 'error',
          description: res.description,
        });
      }
    });
  };

  const getMaskBase64 = async (img: any) => {
    return await new Promise((resolve) => {
      img.onload = function () {
        const { width, height } = img;
        const canvas: any = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
            data[i] = parseInt('0xff');
            data[i + 1] = parseInt('0xff');
            data[i + 2] = parseInt('0xff');
          } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const base64: string = canvas.toDataURL('png');
        resolve(base64);
      };
    });
  };

  const taskCardTitle = (task: any) => {
    let botName = `Midjourney - ${task['displays']['discordInstanceId']}`;
    if (task.botType === 'NIJI_JOURNEY') {
      botName = `niji・journey - ${task['displays']['discordInstanceId']}`;
    } else if (task.botType === 'INSIGHT_FACE') {
      botName = `InsightFaceSwap - ${task['displays']['discordInstanceId']}`;
    }
    if (
      task.status !== 'SUCCESS' &&
      task.status !== 'FAILURE' &&
      task.status !== 'CANCEL' &&
      task.action !== 'SWAP_FACE'
    ) {
      return (
        <>
          <span>{botName}</span>
          <span className={styles.cardTitleTime}>{task.displays['submitTime']}</span>
          <Button
            style={{ marginLeft: '10px' }}
            type="link"
            shape="circle"
            icon={<CloseCircleOutlined />}
            onClick={() => cancelTask(task.id)}
          ></Button>
        </>
      );
    }
    return (
      <>
        <span>{botName}</span>
        <span className={styles.cardTitleTime}>{task.displays['submitTime']}</span>
      </>
    );
  };

  const taskCardSubTitle = (task: any) => {
    let title = task.description;
    const messageContent = task.properties['messageContent'];
    if (messageContent) {
      title = messageContent.replace(/<@[^>]+>/g, '');
    }
    return <Markdown>{title}</Markdown>;
  };

  const taskCardList = () => {
    return tasks.map((task: any) => {
      let avatar = './midjourney.webp';
      if (task.botType === 'NIJI_JOURNEY') {
        avatar = './niji.webp';
      } else if (task.botType === 'INSIGHT_FACE') {
        avatar = './insightface.webp';
      }
      return (
        <Card
          bordered={false}
          key={task.id}
          bodyStyle={{ backgroundColor: '#eaeaea', marginBottom: '10px' }}
        >
          <Meta
            avatar={<Avatar src={avatar} />}
            title={taskCardTitle(task)}
            description={taskCardSubTitle(task)}
          />
          <Flex vertical style={{ paddingLeft: '48px' }}>
            {getTaskCard(task)}
            <Space wrap style={{ marginTop: '7px' }}>
              {actionButtons(task)}
            </Space>
          </Flex>
        </Card>
      );
    });
  };

  const getTaskCard = (task: any) => {
    if (task.action === 'DESCRIBE') {
      return (
        <>
          {getTaskStatus(task)} {getTaskMarkdownInfo(task)} {getTaskImage(task.imageUrl, 120)}
        </>
      );
    } else if (task.action === 'SHORTEN') {
      return (
        <>
          {getTaskStatus(task)} {getTaskMarkdownInfo(task)}
        </>
      );
    } else {
      return (
        <>
          {getTaskStatus(task)}
          {getTaskImage(task.imageUrl, 250)}
        </>
      );
    }
  };

  const getTaskMarkdownInfo = (task: any) => {
    if (!task.properties['finalPrompt']) {
      return <></>;
    }
    const finalPrompt = task.properties['finalPrompt'];
    return <Markdown>{finalPrompt.replace(/(?<!\n)\n/g, '\n\n')}</Markdown>;
  };

  const getTaskStatus = (task: any) => {
    if (task.status === 'FAILURE') {
      return <span className={styles.taskErrorTip}>{task.failReason}</span>;
    } else if (task.status === 'SUCCESS') {
      return <></>;
    } else if (task.status === 'IN_PROGRESS') {
      return <>{getProgress(task)}</>;
    } else {
      let color = 'purple';
      if (task.status === 'SUBMITTED') {
        color = 'lime';
      } else if (task.status === 'CANCEL') {
        color = 'magenta';
      } else if (task.status === 'MODAL') {
        color = 'warning';
      }
      return (
        <span>
          <Tag color={color}>{task.displays['status']}</Tag>
        </span>
      );
    }
  };

  const getTaskImage = (imageUrl: string, width: number) => {
    if (!imageUrl) return <></>;
    return (
      <AntdImage
        width={width}
        src={`${imagePrefix}${imageUrl}`}
        placeholder={<Spin tip="Loading" size="large"></Spin>}
      />
    );
  };

  const getProgress = (task: any) => {
    const text = task.progress;
    let percent = 0;
    if (text && text.indexOf('%') > 0) {
      percent = parseInt(text.substring(0, text.indexOf('%')));
    }
    return (
      <span style={{ width: 250 }}>
        <Progress percent={percent} status="normal" />
      </span>
    );
  };

  const actionButtons = (task: any) => {
    return task.buttons.map((button: any) => {
      return (
        <Button
          ghost
          key={`${task.id}:${button.customId}`}
          style={{ backgroundColor: button.style === 3 ? '#258146' : 'rgb(131 133 142)' }}
          onClick={() => {
            actionTask(task, button);
          }}
          loading={loadingButton === `${task.id}:${button.customId}`}
        >
          {button.emoji} {button.label}
        </Button>
      );
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const actionArea = () => {
    if (botType === 'INSIGHT_FACE') {
      return (
        <Flex vertical>
          <Upload {...props} listType="picture-card">
            {images.length >= 2 ? null : uploadButton}
          </Upload>
          <Button
            style={{ marginTop: '10px' }}
            type="primary"
            onClick={submit}
            loading={submitLoading}
          >
            {intl.formatMessage({ id: 'pages.draw.swapDesc' })}
          </Button>
        </Flex>
      );
    } else if (action === 'show') {
      return (
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder={intl.formatMessage({ id: 'pages.draw.inputIdShow' })}
            value={prompt}
            onChange={handlePromptChange}
            onPressEnter={submit}
          />
          <Button type="primary" onClick={submit} loading={submitLoading}>
            {intl.formatMessage({ id: 'pages.draw.submitTask' })}
          </Button>
        </Space.Compact>
      );
    } else if (action === 'imagine') {
      return (
        <Flex vertical>
          <Upload {...props} listType="picture-card">
            {images.length >= 5 ? null : uploadButton}
          </Upload>
          <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
            <Input
              placeholder="Prompt"
              value={prompt}
              onChange={handlePromptChange}
              onPressEnter={submit}
            />
            <Button type="primary" onClick={submit} loading={submitLoading}>
              {intl.formatMessage({ id: 'pages.draw.submitTask' })}
            </Button>
          </Space.Compact>
        </Flex>
      );
    } else if (action === 'blend') {
      return (
        <Flex vertical>
          <Upload {...props} listType="picture-card">
            {images.length >= 5 ? null : uploadButton}
          </Upload>
          <Space style={{ width: '100%', marginTop: '10px' }}>
            <Radio.Group
              value={dimensions}
              onChange={handleDimensionsChange}
              options={[
                { value: 'PORTRAIT', label: intl.formatMessage({ id: 'pages.draw.PORTRAIT' }) },
                { value: 'SQUARE', label: intl.formatMessage({ id: 'pages.draw.SQUARE' }) },
                { value: 'LANDSCAPE', label: intl.formatMessage({ id: 'pages.draw.LANDSCAPE' }) },
              ]}
              optionType="button"
            />
            <Button type="primary" onClick={submit} loading={submitLoading}>
              {intl.formatMessage({ id: 'pages.draw.submitTask' })}
            </Button>
          </Space>
        </Flex>
      );
    } else if (action === 'describe') {
      return (
        <Flex vertical>
          <Upload {...props} listType="picture-card">
            {images.length >= 1 ? null : uploadButton}
          </Upload>
          <Button
            style={{ marginTop: '10px' }}
            type="primary"
            onClick={submit}
            loading={submitLoading}
          >
            {intl.formatMessage({ id: 'pages.draw.submitTask' })}
          </Button>
        </Flex>
      );
    } else if (action === 'shorten') {
      return (
        <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
          <Input
            placeholder="Prompt"
            value={prompt}
            onChange={handlePromptChange}
            onPressEnter={submit}
          />
          <Button type="primary" onClick={submit} loading={submitLoading}>
            {intl.formatMessage({ id: 'pages.draw.submitTask' })}
          </Button>
        </Space.Compact>
      );
    }
    return <></>;
  };

  const clearCanvas = () => {
    const canvas: any = document.getElementById('canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
  };

  const confirmModal = () => {
    if (!modalImage) {
      return <TextArea rows={3} value={customPrompt} onChange={handleCustomPromptChange} />;
    }
    if (modalRemix) {
      return (
        <Flex vertical>
          <Button style={{ marginBottom: '10px' }} icon={<ClearOutlined />} onClick={clearCanvas}>
            {intl.formatMessage({ id: 'pages.draw.clear' })}
          </Button>
          <canvas
            style={{ backgroundImage: `url('${modalImage}')`, backgroundSize: '100% 100%' }}
            id="canvas"
            width="550"
            height={modalImageHeight}
          ></canvas>
          <TextArea
            style={{ marginTop: '10px' }}
            rows={2}
            value={customPrompt}
            onChange={handleCustomPromptChange}
          />
        </Flex>
      );
    }
    return (
      <Flex vertical>
        <Button style={{ marginBottom: '10px' }} icon={<ClearOutlined />} onClick={clearCanvas}>
          {intl.formatMessage({ id: 'pages.draw.clear' })}
        </Button>
        <canvas
          style={{ backgroundImage: `url('${modalImage}')`, backgroundSize: '100% 100%' }}
          id="canvas"
          width="550"
          height={modalImageHeight}
        ></canvas>
      </Flex>
    );
  };

  function customRequest(option: any) {
    option.onSuccess();
  }

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error(intl.formatMessage({ id: 'pages.draw.onlyJpgPng' }));
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(intl.formatMessage({ id: 'pages.draw.limit10M' }));
    }
    return (isJpgOrPng && isLt10M) || Upload.LIST_IGNORE;
  };

  const props: UploadProps = {
    customRequest,
    beforeUpload,
    fileList: images,
    onChange(info) {
      setImages(info.fileList);
    },
    showUploadList: {
      showRemoveIcon: true,
      showPreviewIcon: false,
    },
  };

  const switchArea = () => {
    let options;
    let isFace = false;
    if (botType === 'INSIGHT_FACE') {
      isFace = true;
      options = [{ value: 'swap', label: '/swap' }];
    } else {
      options = [
        { value: 'imagine', label: '/imagine' },
        { value: 'blend', label: '/blend' },
        { value: 'describe', label: '/describe' },
        { value: 'shorten', label: '/shorten' },
        { value: 'show', label: '/show' },
      ];
    }
    return (
      <Space style={{ marginBottom: '10px' }}>
        <Select
          value={isFace ? 'swap' : action}
          style={{ width: 150 }}
          onChange={handleActionChange}
          options={options}
        />
        <Radio.Group
          value={botType}
          onChange={handleBotTypeChange}
          options={[
            { value: 'MID_JOURNEY', label: 'Midjourney' },
            { value: 'NIJI_JOURNEY', label: 'niji・journey' },
            { value: 'INSIGHT_FACE', label: 'InsightFace' },
          ]}
          optionType="button"
        />
      </Space>
    );
  };

  return (
    <PageContainer>
      {contextHolder}
      <Card
        style={{ marginBottom: '15px', overflow: 'auto', height: '70vh' }}
        loading={dataLoading}
        id="task-panel"
      >
        {taskCardList()}
      </Card>
      <Card>
        {switchArea()}
        {actionArea()}
      </Card>
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={cancelModal}
        onOk={submitModal}
        confirmLoading={loadingModal}
        width={600}
      >
        {confirmModal()}
      </Modal>
    </PageContainer>
  );
};

export default Draw;
