import {useState, useEffect, useRef} from "react";
import {Button, Collapse, Dropdown, Input, message, Modal, Space, Tag, theme} from "antd";
import {DownOutlined, SearchOutlined} from "@ant-design/icons";
import styles from "@/styles/Manage.module.scss";
import deleteConnection from "@/utils/deleteConnection";
import ShowTable from "@/components/manage/ShowTable";
import AddData from "./AddData";
import AddProperty from "./AddProperty";
import api from "@/utils/api";

export default function Manage(props) {
    const {
        token: {colorBgContainer}
    } = theme.useToken();

    const [isOpenAddDataModal, setIsOpenAddDataModal] = useState();
    const [isOpenAddPropertyModal, setIsOpenAddPropertyModal] = useState();
    const [linkList, setLinklist] = useState([]);


    // state
    const [types, setTypes] = useState([[], []]); // 渲染的属性列表
    const [typeState, setTypeState] = useState(null);

    // ref
    const typeRef = useRef(null); // 用以缓存未处理的type数据


    // methods

    const fetchData = async () => {
        const linkRes = await api.getLink();
        if (linkRes.status === 200 && linkRes.data) {
            setLinklist(linkRes.data.data.links);
        }
    };

    /**
     * 获取属性类别
     */
    const getTypes = async () => {
        const res = await api.getLinksByType({});
        let output = [[], []];
        typeRef.current = Object.values(res.data.data);
        setTypeState(Object.values(res.data.data));
        Object.values(res.data.data).forEach((value, index) => {
            value.forEach((value2) => {
                output[index].push(value2.linkComment);
            });
        });
        setTypes(output);
    };

    /**
     * 转换属性类别
     * @param target
     * @param fromWhere
     */
    const changeType = (target, fromWhere) => {
        const findResult = typeRef.current[fromWhere].find((value) => {
            return value.linkComment === target;
        });
        api.changeLinkType(findResult).then(() => {
            getTypes();
        }, (err) => {
            console.error(err);
        });
    };


    const items = [
        {
            label: "sadfsad",
            key: "1"
        },
        {
            label: "sdafsa",
            key: "2"
        }
    ];

    const handleMenuClick = (e) => {
        message.info("click!");
        console.log("click", e);
    };

    const menu = {
        items,
        onClick: handleMenuClick
    };


    useEffect(() => {
        fetchData();
        getTypes();
        return () => {
            setTypes([[], []]);
        };
    }, []);

    return (
        <div className={styles.site_layout_content_show}>
            <div className={styles.title}>
                <span>{props.missionName.current}</span>
                <Button
                    onClick={() => {
                        deleteConnection(props.connectionId.current, props.fetchData);
                    }}
                    className={styles.delete_connection_btn}
                >
                    删除任务
                </Button>
            </div>
            <div className={styles.property_box}>
                <div className={styles.property_type}>属性类别（点击切换标签类别）</div>
                <div className={styles.btn_box}>
                    <Button
                        onClick={() => {
                            console.log(linkList);
                            setIsOpenAddPropertyModal(true);
                        }}
                    >
                        导入
                    </Button>
                    <Button className={styles.import_data_btn}>导入记录</Button>
                </div>
            </div>
            <Collapse
                expandIconPosition="end"
                style={{backgroundColor: colorBgContainer}}
            >
                <Collapse.Panel
                    key={1}
                    header={
                        <>
                            <span className={styles.collapse_panel_span}>名词类</span>
                            {types[1].slice(0, 5).map((value, index) => {
                                return <Tag key={index}>{value}</Tag>;
                            })}
                        </>
                    }
                >
                    {types[1].map((value, index) => {
                        return (
                            <Tag
                                color="#6e84c9"
                                style={{padding: "3px 15px", marginBottom: "5px", cursor: "pointer"}}
                                key={index}
                                onClick={() => {
                                    Modal.confirm({
                                        title: (
                                            <span style={{fontWeight: 400}}>
                                                是否切换<span style={{fontWeight: 700}}> {value} </span>到<span
                                                style={{fontWeight: 700}}> 数值类 </span>？
                                            </span>
                                        ),
                                        okText: "确定",
                                        cancelText: "取消",
                                        onOk() {
                                            changeType(value, 1);
                                        }
                                    });
                                }}
                            >
                                {value}
                            </Tag>
                        );
                    })}
                </Collapse.Panel>
                <Collapse.Panel
                    key={2}
                    header={
                        <>
                            <span className={styles.collapse_panel_span}>数值类</span>
                            {types[0].slice(0, 5).map((value, index) => {
                                return <Tag key={index}>{value}</Tag>;
                            })}
                        </>
                    }
                >
                    {types[0].map((value, index) => {
                        return (
                            <Tag
                                color="#6e84c9"
                                style={{padding: "3px 15px", marginBottom: "5px", cursor: "pointer"}}
                                key={index}
                                onClick={() => {
                                    Modal.confirm({
                                        title: (
                                            <span style={{fontWeight: 400}}>
                                                是否切换<span style={{fontWeight: 700}}> {value} </span>到<span
                                                style={{fontWeight: 700}}> 名词类 </span>？
                                            </span>
                                        ),
                                        okText: "确定",
                                        cancelText: "取消",
                                        onOk() {
                                            changeType(value, 0);
                                        }
                                    });
                                }}
                            >
                                {value}
                            </Tag>
                        );
                    })}
                </Collapse.Panel>
            </Collapse>
            <div className={styles.show_data_box}>
                <div className={styles.show_data_title}>数据展示</div>
                <Button
                    size={"small"}
                    type={"primary"}
                    className={styles.plus_btn}
                    onClick={() => {
                        setIsOpenAddDataModal(true);
                    }}
                >
                    +
                </Button>
                <div className={styles.search_bigbox}>
                    <Dropdown menu={menu} className={styles.dropdown}>
                        <Button>
                            <Space>
                                姓名
                                <DownOutlined/>
                            </Space>
                        </Button>
                    </Dropdown>
                    <Input
                        className={styles.search_box}
                        placeholder={"你想查询的内容..."}
                    />
                    <Button className={styles.search_btn} type={"primary"}>
                        <SearchOutlined/>
                    </Button>
                </div>
            </div>
            <ShowTable types={typeState ? typeState : null}/>
            <AddData
                linkList={linkList}
                isOpenAddDataModal={isOpenAddDataModal}
                setIsOpenAddDataModal={setIsOpenAddDataModal}
            />
            <AddProperty
                connectionId={props.connectionId}
                isOpenAddPropertyModal={isOpenAddPropertyModal}
                setIsOpenAddPropertyModal={setIsOpenAddPropertyModal}
            />
        </div>
    );
}