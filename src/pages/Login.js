import React, { useState } from 'react';
import Form, { ButtonItem, Item, Label, ButtonOptions, GroupItem } from 'devextreme-react/form';
import { RequiredRule } from 'devextreme-react/validator';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import useForm from './../hooks/useForm';
import useAuth from './../hooks/useAuth';
import notify from 'devextreme/ui/notify';
import loginBg from '../assets/zes-login.png';


const animation = {
  show: {
    type: "slide",
    from: {
      left: 1000,
      opacity: 0.2
    },
    to: {
      opacity: 1
    },
    duration: 500
  }
  ,
  hide: {
    type: "slide",
    to: {
      opacity: 0,
      right: -1000
    },
    duration: 500
  }
}



export default function Login() {
  const [loading, setLoading] = useState(false);
  const { values, handleChange } = useForm({
    initialValues: {
      username: '',
      password: ''
    }
  });
  const { loginUser, error } = useAuth();
  const [isChecked, setIsChecked] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // console.log(username, password);
    let res = await loginUser(values);
    if (res !== true) {
      // TODO find a more dynamic way of implementing notification in the entire codebase
      notify({
        message: res, width: 300, position: {
          my: 'right top',
          at: 'right top',
          of: "#floating-div"
        },
        animation: animation
      }, "warning", 2500);
      setLoading(false);
    } else {

      notify({
        message: 'Амжилттай нэвтэрлээ', width: 300, position: {
          my: 'right top',
          at: 'right top',
          of: "#floating-div-2"
        },
        animation: animation
      }, "success", 2500);
    }
  }

  return (
    <div className='login-container w-full flex flex-row min-h-full bg-white'>
      <div className='login'>
        <div className='login-main-div'>
          <div className='h-[140px] w-full bg-no-repeat bg-center bg-[length:120px] absolute top-3'/>
          <div style={{ position: 'absolute', top: '20rem' }}>
            <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: '2rem' }}>ҮЙЛДВЭРИЙН ХЯНАЛТ УДИРДЛАГЫН СИСТЕМ</p>
            <form onSubmit={handleLogin}>
              <Form formData={values} labelMode="floating">
                <Item
                  cssClass="usernameInputClass mb-3"
                  dataField="username"
                  label={{ text: 'Нэвтрэх нэр' }}
                  editorType="dxTextBox"
                  editorOptions={{ stylingMode: 'filled', mode: 'text', disabled: loading }}
                >
                  <RequiredRule message="Нэвтрэх нэр оруулна уу" />
                </Item>
                <Item
                  cssClass="passwordInputClass mb-3"
                  dataField="password"
                  editorType="dxTextBox"
                  label={{ text: "Нууц үг" }}
                  editorOptions={{ stylingMode: 'filled', mode: "password", disabled: loading }}
                >
                  <RequiredRule message="Нууц үг оруулна уу" />
                </Item>
                <Item
                  render={() => <div className='mb-2' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" id="rememberMe" name="isChecked" value={isChecked} checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
                      <label for="rememberMe" style={{ marginLeft: 5 }}>Намайг сана</label>
                    </div>
                    <div>Нууц үг мартсан?</div>
                  </div>}
                />
                <ButtonItem cssClass={'submitButton mt-4'}>
                  <ButtonOptions
                    height={50}
                    width={'100%'}
                    disabled={loading}
                    component={() => {
                      return <span className="dx-button-text" >
                        <LoadIndicator style={{ height: 20, width: 20 }} visible={loading} />
                        {!loading && <span>Нэвтрэх</span>}
                      </span>
                    }}
                    useSubmitBehavior={true}
                  />
                </ButtonItem>
              </Form>
            </form>
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, position: 'absolute', bottom: '1.5rem' }}>
            ЗЭС ЭРДЭНИЙН ХУВЬ ХК @{new Date().getFullYear()}
          </div>
        </div>
      </div>
      <div class="container">
        <img src={loginBg} style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundPosition: 'right' }} />
      </div>
    </div>
  )
}
