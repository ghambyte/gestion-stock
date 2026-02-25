import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import { HiOutlineCube } from 'react-icons/hi'

const Logo = (props) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        style,
        logoWidth = 'auto',
    } = props

    const textColor = mode === 'dark' ? 'text-white' : 'text-gray-900'

    return (
        <div
            className={classNames('logo flex items-center gap-2', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
                <HiOutlineCube className="text-lg" />
            </div>
            {type === 'full' && (
                <span className={classNames('font-bold text-xl', textColor)}>
                    {APP_NAME}
                </span>
            )}
        </div>
    )
}

export default Logo
