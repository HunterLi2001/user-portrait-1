import { Button, message, Modal } from "antd";

import styles from "@/styles/CharContent.module.scss";
import ShowProperty from "./ShowProperty";
import AddChar from "./AddChar";
import ItemList from "@/components/echar/ItemList";
import BasicBar from "./BasicBar";
import { useEffect, useState } from "react";
import api from "@/utils/api";

const { confirm } = Modal;

export default function CharContent(props) {
	//console.log(props);
	const [charList, setCharList] = useState([]);
	const [deleteIdx, setDeleteIdx] = useState();
	// 属性分组
	const [propertyList, setPropertyList] = useState({});
	// 添加图表弹窗
	const [isModalOpen, setIsModalOpen] = useState();
	const [defaultOption, setDefaultOption] = useState();

	useEffect(() => {
		setCharList([]);
	}, [props.connectionId.current]);

	// 增加图表
	const addViewChar = (viewDataList) => {
		const data = viewDataList.map((item) => {
			if (typeof item.viewData === "string") {
				item.viewData = {
					...JSON.parse(item.viewData),
					status: "open",
					viewId: item.viewId,
				};
			} else {
				item.viewData = {
					...item.viewData,
					status: "open",
					viewId: item.viewId,
				};
			}
			return item.viewData;
		});
		setCharList(data);
	};

	// 删除图表
	const deleteChar = (index) => {
		console.log(charList);
		const viewId = charList[index].viewId;
		api.deleteViewInfo({ viewId }).then((res) => {
			message.success(res.data.msg);
		});
		setCharList((pre) => pre.filter(item => item.viewId !== viewId));
	};

	//切换图表显示状态
	const changeStatus = (index, status) => {
		const data = [...charList];
		const newStatus = status === "open" ? "close" : "open";
		const newState = data.splice(index, 1);
		newState[0].status = newStatus;
		setCharList([...data, ...newState]);
	};

	//获取已导入的属性
	const handlePropsData = () => {
		return props.linklist.map((value) => {
			return value.linkComment;
		});
	};

	// 生成图表
	const handleClick = () => {
		// 点击后请求属性
		setIsModalOpen(true);
		api.getLinksByType().then((res) => {
			if (res.status === 200 && res.data.data) {
				setPropertyList(res.data.data);
			}
		});
	};

	//修改图表
	const changeViewInfo = (bool, defaultOption = undefined) => {
		setIsModalOpen(bool);
		defaultOption && setDefaultOption(defaultOption);
	};

	//获取图表信息
	useEffect(() => {
		api.getViewInfo().then((res) => {
			addViewChar(res.data.data);
		});
	}, []);

	return (
		<div className={styles.site_layout_content_show}>
			<div className={styles.title}>
				<span>{props.missionName.current}</span>
			</div>
			<ShowProperty property={handlePropsData()} />
			{charList.length !== 0 && (
				<ItemList
					connectionId={props.connectionId.current}
					charList={charList}
					deleteIdx={deleteIdx}
					changeStatus={changeStatus}
					deleteChar={deleteChar}
					changeViewInfo={changeViewInfo}
				/>
			)}
			<Button style={{ marginTop: "20px" }} onClick={handleClick}>
				生成图表
			</Button>
			<AddChar
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				setDefaultOption={setDefaultOption}
				connectionId={props.connectionId}
				addViewChar={addViewChar}
				propertyList={propertyList}
				defaultOption={defaultOption}
			/>
			{charList.length
				? charList.map((item, index) => {
						if (item.status === "open") {
							return (
								<BasicBar
									key={item.viewId}
									index={index}
									charOption={item}
									changeStatus={changeStatus}
								/>
							);
						}
				  })
				: null}
		</div>
	);
}
