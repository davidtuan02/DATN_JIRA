import { Meta, StoryFn } from '@storybook/angular';
import { AvatarComponent } from './avatar.component';

export default {
  title: 'Components/Avatar',
  component: AvatarComponent
} as Meta<AvatarComponent>;

const avatarUrl =
  'https://res.cloudinary.com/dvujyxh7e/image/upload/c_scale,w_128/v1593253478/trung-vo_bioxmc.png';

const Template: StoryFn<AvatarComponent> = (args: AvatarComponent) => ({
  component: AvatarComponent,
  props: args
});

export const Rounded: StoryFn<AvatarComponent> = Template.bind({});
Rounded.args = {
  avatarUrl,
  size: 64
};

export const Square: StoryFn<AvatarComponent> = Template.bind({});
Square.args = {
  avatarUrl,
  size: 64,
  rounded: false
};
