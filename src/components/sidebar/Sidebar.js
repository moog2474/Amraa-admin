import styles from './Sidebar.module.css';
import img1 from '../../assets/imgs/zes-logo.png';
import { NavLink } from "react-router-dom";
import { Menu, ConfigProvider } from 'antd';



const Sidebar = (props) => {
    const text = (item, type) => {
        let itemOther = item?.other?.[0]
        switch (type) {
            case "title":
                return itemOther?.parent_name
            case "description":
                return itemOther?.parent_description
            default:
                break;
        }
    }
    // console.log('user', user.org_id);

    const items = props.result.map((item, index) => {
        const key = String(index + 1)
        return {
            key: `parent-menu-${key}`,
            icon: <img src={item.other[0].img_icon} height={16} />,
            label: <NavLink to={'/' + item.other[0].parent_menu_url} style={{ textTransform: 'uppercase', letterSpacing: 0.3, fontSize: 13, fontWeight: 700, color: 'black', marginLeft: '1rem' }}>{text(item, "title")}</NavLink>,
            children: item.other.map((e, i) => {
                const subKey = index * 4 + i + 1;
                return {
                    key: `sub-menu-${subKey}`,
                    label: <NavLink to={'/' + e.sub_menu_url} style={{ marginLeft: '1.2rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span>{e.sub_name}</span>
                    </NavLink>
                }
            })
        }
    })


    return (
        <>
            <ConfigProvider
                theme={{
                    components: {
                        Menu: {
                            itemSelectedBg: '#FEF5EF',
                            itemSelectedColor: 'black',
                            subMenuItemBg: 'white',
                            itemHoverBg: '#f8f9fa',
                            itemPaddingInline: 24
                        }
                    }
                }}
            >

                <nav className={`sidebar ${styles.sidebar} ${props.toggle ? styles.show : styles.hide}`}
                    style={{ height: '90vh', zIndex: 3 }}>
                    <div className={styles.sidebarWrap}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
                            <img src={img1} className={styles.sidebarTopLogo} />

                        </div>
                        <Menu
                            mode='inline'
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['parent1']}
                            style={{
                                height: '100%',
                                borderRight: 0,
                            }}

                            items={items}
                        />
                    </div>
                </nav>
            </ConfigProvider>

        </>
    );
};

export default Sidebar;
