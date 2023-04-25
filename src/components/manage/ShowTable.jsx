import {Form, Input, InputNumber, Modal, Table, Tag} from "antd";
import React, {useEffect, useReducer, useRef, useState} from "react";
import styles from "@/styles/ShowTable.module.scss";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import api from "@/utils/api";

/**
 *  可供修改的单元格
 *   @param editing
 *   @param dataIndex
 *   @param title
 *   @param inputType
 *   @param record
 *   @param index
 *   @param children
 *   @param restProps
 *   @returns {JSX.Element}
 *   @constructor
 */
const EditableCell = ({editing, dataIndex, title, inputType, record, index, children, ...restProps}) => {
    const inputNode = inputType === "number" ? <InputNumber/> : <Input/>;
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0
                    }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`
                        }
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

/**
 * 展示表格
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ShowTable = (props) => {
    // hooks
    const [form] = Form.useForm();

    // state
    const [data, setData] = useState([]); // 源数据
    const [editingKey, setEditingKey] = useState(""); // 修改的位置

    // ref
    const columns = useRef([]); // 暂存的表格位置

    // methods
    const getTableData = () => {
        api.getAllData().then((res) => {
            setData(res.data.data);
            columns.current = handleColumns();
        });
    };

    /**
     * 对表头进行设置
     * @returns {{dataIndex: *, editable: boolean, title: *}[]}
     */
    const handleColumns = () => {
        let temp = [];
        if (props.types) {
            temp = props.types.flat(1).map((value, index) => {
                return {
                    title: value.linkComment,
                    dataIndex: value.linkId,
                    key: index,
                    editable: true,
                    // width: "2000",
                    textWrap: "word-break"
                    // ellipsis: true,
                };
            });
        }
        let output = {
            title: "操作",
            dataIndex: "operation",
            width: "17%",
            fixed: "right",
            render: (_, record) => {
                const editable = isEditing(record); // TODO 这里没有监测到数值变化，没有重新渲染，有没有方法让其强制重新渲染或者能够检测得到？
                return editable ? (
                    <span>
                                <Tag className={styles.tags} color={"green"} onClick={() => {
                                    Modal.confirm({
                                        title: "你确定要修改吗?",
                                        onOk: () => {
                                            save(record.id);
                                        },
                                        okText: "确定",
                                        cancelText: "取消"
                                    });
                                }}><CheckOutlined/></Tag>
                                    <Tag className={styles.tags} color={"red"} onClick={() => {
                                        cancel();
                                    }}><CloseOutlined/></Tag>
                            </span>
                ) : (
                    <>
                        <Tag className={styles.tags} color={"blue"} onClick={() => edit(record)}>编辑</Tag>
                        <Tag className={styles.tags} color={"red"} onClick={() => handleDelete(record)}>删除该行</Tag>
                    </>
                );
            }
        };
        temp.push(output);
        return temp;
    };


    /**
     * 是否处于编辑状态
     * TODO 当前变量出现了无法检测到状态更新的问题，先这样
     * @param record
     * @returns {boolean}
     */
    const isEditing = (record) => record.id === editingKey;

    /**
     * 编辑表格
     * @param record
     */
    const edit = (record) => {
        form.setFieldsValue({
            name: "",
            age: "",
            address: "",
            ...record
        });
        setEditingKey(record.id);
    };

    /**
     * 取消编辑(x键)
     */
    const cancel = () => {
        setEditingKey("");
    };

    /**
     * 保存修改
     * @param key
     * @returns {Promise<void>}
     */
    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                setData(newData);
                setEditingKey("");
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey("");
            }
        } catch (errInfo) {
            console.log("Validate Failed:", errInfo);
        }
    };

    /**
     * 删除某一行数据
     * @param data
     */
    const handleDelete = (data) => {
        Modal.confirm({
            title: "你确定要删除该行数据吗？",
            okText: "确定",
            cancelText: "取消",
            onOk() {
                api.deleteDataById(data).then(() => {
                    getTableData();
                });
            }
        });

    };

    /**
     * 对传入的column进行精细化处理，使得能够被正式渲染上去
     * @type {unknown[]}
     */
    const mergedColumns = columns.current.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === "age" ? "number" : "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record)
            })
        };
    });

    // tableProps
    const tableProps = {
        size: "middle",
        className: styles.table,
        components: {
            body: {
                cell: EditableCell
            }
        },
        bordered: true,
        pagination: {
            // position: ["none", "bottomRight"],
            // pageSize: 6
            onChange: cancel
        },
        scroll: {
            x: "100%",
            y: "33.7vh"
        },
        dataSource: data,
        columns: mergedColumns,
        sticky: true
    };

    useEffect(() => {
        getTableData();
        return () => {
            setData([]);
        };
    }, [props.types,editingKey]); // TODO editingKey暂时解决不能变化的问题

    return (
        <Form form={form} component={false}>
            <Table {...tableProps}/>
        </Form>
    );
};
export default ShowTable;